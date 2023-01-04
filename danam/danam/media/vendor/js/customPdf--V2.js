var i;
for (i = 1; i <= mypdfslength; i++) {
    console.log(mypdfslength);
    const mydata = JSON.parse(document.getElementById('mydata').textContent);
    console.log(mydata);
    // The workerSrc property shall be specified.
    pdfjsLib.GlobalWorkerOptions.workerSrc = '//mozilla.github.io/pdf.js/build/pdf.worker.js';

    // Asynchronous download of PDF

    var loadingTask = pdfjsLib.getDocument(mydata);
    loadingTask.promise.then(function (pdf) {
        console.log('PDF loaded');

        // Fetch the first page
        var pageNumber = 1;
        var prefix = 'the-canvas';
        pdf.getPage(pageNumber).then(function (page) {
            console.log('Page loaded');

            var scale = 0.5;
            var viewport = page.getViewport({ scale: scale });

            // Prepare canvas using PDF page dimensions
            var canvas = document.getElementById(prefix + {i});
            var context = canvas.getContext('2d');
            canvas.height = viewport.height;
            canvas.width = viewport.width;

            // Render PDF page into canvas context
            var renderContext = {
                canvasContext: context,
                viewport: viewport
            };
            var renderTask = page.render(renderContext);
            renderTask.promise.then(function () {
                console.log('Page rendered');
            });
        });
    }, function (reason) {
        // PDF loading error
        console.error(reason);
    });
}

