#!/bin/bash

set -- ${DOMAIN_NAMES}
PRIMARY_DOMAIN_NAME=$1
LETSENCRYPT_BASEDIR="${LETSENCRYPT_BASEDIR:-/etc/letsencrypt}"
LETSENCRYPT_LIVEDIR=${LETSENCRYPT_BASEDIR}/live
LETSENCRYPT_LOCALHOST_DIR=${LETSENCRYPT_LIVEDIR}/localhost
LETSENCRYPT_DOMAIN_DIR=${LETSENCRYPT_LIVEDIR}/${PRIMARY_DOMAIN_NAME}
NGINX_BASEDIR="/etc/nginx/"
NGINX_CONF=${NGINX_BASEDIR}/nginx.conf
SITES_ENABLED_DIR=${NGINX_BASEDIR}/sites-enabled
INCLUDE_STATIC_FILES_PATH=${NGINX_BASEDIR}/include.static_files
WEB_ROOT="${WEB_ROOT:-/var/www}"
STATIC_URL=${STATIC_URL}
CMS_URL=${CMS_URL}
FULLCHAIN_FILENAME=fullchain.pem
PRIVATE_KEY_FILENAME=privkey.pem

MIME_TYPES="${MIME_TYPES:-default}"

wait_for_certificate() {
	while true; do
		if [[ ! -d ${LETSENCRYPT_DOMAIN_DIR} ]]; then
			echo "Waiting for certificate for ${PRIMARY_DOMAIN_NAME} to download..."
			sleep 5
		else
			break
		fi
	done
}

start_nginx_background() {
    echo "Temporarilly starting NginX in order to let the certificate service verify something is running on port 80..."
	service nginx start
}

stop_nginx_background() {
    echo "Stopping Nginx in order to reload config and run it in the foreground..."
	service nginx stop
}

start_nginx_foreground() {
	echo "Running Nginx on ${DOMAIN_NAME} in the foreground"
	exec nginx -g 'daemon off;'
}

set_search_engine_settings() {
	if [[ ${PUBLIC_MODE} == True ]]; then
		allow_text=""
		replace_values_in_dir ${SITES_ENABLED_DIR} "<allow_or_disallow>" "${allow_text}"
	else
		disallow_text=" /"
		replace_values_in_dir ${SITES_ENABLED_DIR} "<allow_or_disallow>" "${disallow_text}"
	fi
}

set_static_url() {
	if [[ ! -z ${STATIC_URL} ]] && [[ ! "${STATIC_URL}" == "" ]]; then
		static_url_location_block="location ${STATIC_URL} {	alias /www/static/; include ${INCLUDE_STATIC_FILES_PATH}; }"
	else
		static_url_location_block=""
	fi
	replace_values_in_dir ${SITES_ENABLED_DIR} "<static_url_location_block>" "${static_url_location_block}"
}

set_media_url() {
	if [[ ! -z ${MEDIA_URL} ]] && [[ ! "${MEDIA_URL}" == "" ]]; then
		media_url_location_block="location ${MEDIA_URL} {	alias /www/media; autoindex on; sendfile  on; sendfile_max_chunk 80m; autoindex_exact_size off; }"
	else
		media_url_location_block=""
	fi
	replace_values_in_dir ${SITES_ENABLED_DIR} "<media_url_location_block>" "${media_url_location_block}"

	replace_values_in_dir ${SITES_ENABLED_DIR} "<media_url>" "${MEDIA_URL}"
}

set_cms_url() {
	if [[ ! -z ${CMS_URL} ]] && [[ ! "${CMS_URL}" == "" ]]; then
		cms_url_location_block="location ${CMS_URL} {	alias /www/danam_cms; autoindex on; sendfile  on; sendfile_max_chunk 80m; autoindex_exact_size off; }"
	else
		cms_url_location_block=""
	fi
	replace_values_in_dir ${SITES_ENABLED_DIR} "<cms_url_location_block>" "${cms_url_location_block}"

	replace_values_in_dir ${SITES_ENABLED_DIR} "<cms_url>" "${CMS_URL}"
}

initialize_nginx_configuration() {
	echo ""
	echo "Initializing NginX to run on: ${DOMAIN_NAMES}"
	echo ""
	echo "Setting Nginx up as reverse proxy for **local** Docker container: ${LOCAL_PROXY_HOST}..."
	if [[ "${NGINX_PROXY_MODE}" == "local_and_remote" ]]; then
		echo "Setting Nginx up as reverse proxy for **remote** Docker container: ${REMOTE_PROXY_HOST}..."
	fi

	copy_nginx_configuration_files
	set_nginx_environment_variables
	set_static_url
	set_media_url
	set_cms_url
}

copy_nginx_configuration_files() {
	echo "Copying Nginx configuration files..."
	mkdir -p ${SITES_ENABLED_DIR}

	cp ${INSTALL_DIR}/nginx_base.conf ${NGINX_CONF}
	cp ${INSTALL_DIR}/include.static_files ${INCLUDE_STATIC_FILES_PATH}
	copy_nginx_http_conf

	if [[ "${NGINX_PROTOCOL}" == "strict-https" ]]; then
		copy_nginx_https_conf
	fi
}

copy_nginx_http_conf() {
	if [[ "${NGINX_PROTOCOL}" == "strict-https" ]]; then
		cp ${INSTALL_DIR}/sites-enabled/http-strict-https.conf ${SITES_ENABLED_DIR}/http.conf
	else
		cp ${INSTALL_DIR}/sites-enabled/http_${NGINX_PROXY_MODE}_proxy.conf ${SITES_ENABLED_DIR}/http.conf
	fi
}

copy_nginx_https_conf() {
	cp ${INSTALL_DIR}/sites-enabled/https_${NGINX_PROXY_MODE}_proxy.conf ${SITES_ENABLED_DIR}/https.conf
}

set_nginx_environment_variables() {
	replace_values_in_dir ${SITES_ENABLED_DIR} "<local_proxy_host>" "${LOCAL_PROXY_HOST}"
	replace_values_in_dir ${SITES_ENABLED_DIR} "<local_proxy_port>" "${LOCAL_PROXY_PORT}"
	replace_values_in_dir ${SITES_ENABLED_DIR} "<remote_proxy_host>" "${REMOTE_PROXY_HOST}"
	replace_values_in_dir ${SITES_ENABLED_DIR} "<remote_proxy_port>" "${REMOTE_PROXY_PORT}"
	replace_values_in_dir ${SITES_ENABLED_DIR} "<remote_proxy_subpath>" "${REMOTE_PROXY_SUBPATH}"
	replace_values_in_dir ${SITES_ENABLED_DIR} "<domain_names>" "${DOMAIN_NAMES}"
	replace_values_in_dir ${SITES_ENABLED_DIR} "<primary_domain_name>" "${PRIMARY_DOMAIN_NAME}"
	replace_values_in_dir ${NGINX_BASEDIR} "<script_source_allowed_hosts>" "${SCRIPT_SOURCE_ALLOWED_HOSTS}"
	replace_values_in_dir ${NGINX_BASEDIR} "<x_frame_allowed_hosts>" "${X_FRAME_ALLOWED_HOSTS}"
}

set_nginx_certificate_paths() {
	if [[ "${PRIMARY_DOMAIN_NAME}" != "localhost" ]]; then
		echo "Setting NginX conf to use certificates in ${LETSENCRYPT_DOMAIN_DIR}..."
		replace_values_in_dir ${SITES_ENABLED_DIR} "${LETSENCRYPT_LOCALHOST_DIR}" "${LETSENCRYPT_DOMAIN_DIR}"
	fi
}

copy_localhost_certificates() {
	mkdir -p ${LETSENCRYPT_LOCALHOST_DIR}
	if [[ ! -f ${LETSENCRYPT_LOCALHOST_DIR}/${FULLCHAIN_FILENAME} ]]; then
		cp ${INSTALL_DIR}/${FULLCHAIN_FILENAME} ${LETSENCRYPT_LOCALHOST_DIR}
	fi
	if [[ ! -f ${LETSENCRYPT_LOCALHOST_DIR}/${PRIVATE_KEY_FILENAME} ]]; then
		cp ${INSTALL_DIR}/${PRIVATE_KEY_FILENAME} ${LETSENCRYPT_LOCALHOST_DIR}
	fi
}

check_all_variables() {
	check_variable "${DOMAIN_NAMES}" DOMAIN_NAMES
	check_variable "${LOCAL_PROXY_HOST}" LOCAL_PROXY_HOST
	check_variable "${LOCAL_PROXY_PORT}" LOCAL_PROXY_PORT
	check_variable "${NGINX_PROXY_MODE}" NGINX_PROXY_MODE
	check_variable "${NGINX_PROTOCOL}" NGINX_PROXY_MODE

	if [[ ! "${NGINX_PROTOCOL}" == "http" ]] && [[ ! "${NGINX_PROTOCOL}" == "strict-https" ]]; then
		echo "Invalid value for NGINX_PROTOCOL, exiting..."
		exit 1
	fi

	if [[ ! "${NGINX_PROXY_MODE}" == "local" ]] && [[ ! "${NGINX_PROXY_MODE}" == "local_and_remote" ]]; then
		echo "Invalid value for NGINX_PROXY_MODE, exiting..."
		exit 1
	fi

	if [[ "${NGINX_PROXY_MODE}" == "local_and_remote" ]]; then
		check_variable "${REMOTE_PROXY_HOST}" REMOTE_PROXY_HOST
		check_variable "${REMOTE_PROXY_PORT}" REMOTE_PROXY_PORT
		check_variable "${REMOTE_PROXY_SUBPATH}" REMOTE_PROXY_SUBPATH
		if [[ ! ${REMOTE_PROXY_SUBPATH} == /* ]]; then
			echo "ERROR! Parameter REMOTE_PROXY_SUBPATH should be a path starting with '/'. Exiting..."
			exit 1
		fi
	fi
}

check_variable() {
	local VARIABLE_VALUE=$1
	local VARIABLE_NAME=$2
	if [[ -z ${VARIABLE_VALUE} ]] || [[ "${VARIABLE_VALUE}" == "" ]]; then
		echo "ERROR! Environment variable ${VARIABLE_NAME} not specified. Exiting..."
		exit 1
	fi
}

replace_values_in_dir() {
	local DIRECTORY=$1
	local ORIGINAL_VALUE=$2
	local NEW_VALUE=$3
	find ${DIRECTORY} -type f -exec sed -i "s#${ORIGINAL_VALUE}#${NEW_VALUE}#g" {} \;
}

set_mime_types() {
	if [[ ${MIME_TYPES} == "default" ]]; then
		echo "Using default Nginx mime types."
	elif [[ ${MIME_TYPES} == "3D" ]]; then
		cp ${INSTALL_DIR}/mime.types.3d /etc/nginx/mime.types
		echo "Using mime types for 3D content."
	else
		echo "Invalid value for environment variable MIME_TYPES, using default."
	fi
}

clear_cache() {
	echo "Clearing cache..."
	rm -rf /tmp/web_cache/*
}


#### Starting point
# For LetsEncrypt acme challange
mkdir -p ${WEB_ROOT}

check_all_variables
initialize_nginx_configuration
copy_localhost_certificates

# This is in case you forget to close ports 80/443 on a test/demo environment:
# Environment variable PUBLIC_MODE needs to be explicitly set to True if search enginges should index this website
set_search_engine_settings

if [[ "${PRIMARY_DOMAIN_NAME}" != "localhost" ]] && [[ ! -d ${LETSENCRYPT_DOMAIN_DIR} ]] && [[ "${NGINX_PROTOCOL}" == "strict-https" ]]; then
	start_nginx_background
	wait_for_certificate
	stop_nginx_background
fi

set_nginx_certificate_paths
set_mime_types
clear_cache
start_nginx_foreground
