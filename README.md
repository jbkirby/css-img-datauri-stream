css-img-datauri-stream
======================

Accepts a file argument and an (optional) opts argument. For a CSS file passed as input, returns a [through stream](https://github.com/dominictarr/through) with references to local images replaced by inline [data URIs](http://css-tricks.com/data-uris/). All other files return a vanilla through stream.

The opts argument object may contain the following:
'maxImageSize' : size (in bytes) beyond which local images references will not be converted to data URIs.

Can be used as a [parcelify](https://github.com/rotundasoftware/parcelify) transform.

#usage
### css-img-datauri-stream(file [, opts])
`file` - the CSS file to transform
`opts` - optional options object specifying a byte size beyond which local images references will not be converted to data URIs.
