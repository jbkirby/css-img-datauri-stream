/**
 * Transform image URL references into inline data URIs.
 */

var through = require( "through" );
var path = require( "path" );

module.exports = function( file, opts ) {
	var data = "";
	if( file !== undefined && path.extname( file ) !== ".css" )
		return through();
	else
		return through( write, end );

	function write(buf) {
		data += buf;
	}

	function end() {
		this.queue(data);
		// try {
		// 	this.queue( sass.renderSync( data, opts ) );
		// } catch( err ) {
		// 	this.emit( 'error', new Error( err ) );
		// }

		this.queue( null );
	}
};
