css-img-datauri-stream
======================

Accepts a file argument and an optional opts argument. For a CSS file passed as input, returns a [through stream](https://github.com/dominictarr/through) with references to local images replaced by inline [data URIs](http://css-tricks.com/data-uris/). All other files return a vanilla through stream.

Can be used as a [parcelify](https://github.com/rotundasoftware/parcelify) transform.
