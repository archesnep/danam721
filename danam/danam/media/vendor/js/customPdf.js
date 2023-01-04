var i;
for (i = 0; i < mypdfslength; i++) {
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
        pdf.getPage(pageNumber).then(function (page) {
            console.log('Page loaded');

            var scale = 0.5;
            var viewport = page.getViewport({ scale: scale });

            // Prepare canvas using PDF page dimensions
            for (var a = 1; a <= mypdfslength; a++) {

                var canvas = document.getElementById("the-canvas" + a);
                if (this.pdf_doc) {
                    this.pdf_doc.destroy();
                }
            }
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
    break;
}