import D3 "mo:d3storage/D3";
import Blob "mo:base/Blob";
import Debug "mo:base/Debug";
import Put "mo:d3storage/D3/modules/put";
import OutputTypes "mo:d3storage/D3/types/output";
import Get "mo:d3storage/D3/modules/get";

shared ({ caller }) actor class Backend() = this {
	stable let d3 = D3.D3();

	public func uploadMetadata({
		filesize : Nat64;
		filename : Text;
		filetype : Text;
	}) : async OutputTypes.StoreFileMetadataOutputType {

		let response = await Put.storeFileMetadata({
			d3;
			storeFileMetadataInput = {
				fileSizeInBytes = filesize;
				fileName = filename;
				fileType = filetype;
			};
		});

		Debug.print("upload metadata response :" # debug_show (response));
		return response;
	};

	public func uploadChunkedFile({ id : Text; data : Blob; index : Nat64 }) : async OutputTypes.StoreFileChunkOutputType {
		
		let response = await Put.storeFileChunk({
			d3;
			storeFileChunkInput = {
				fileId = id;
				chunkData = data;
				chunkIndex = index;
			};
		});

		Debug.print("upload chunk response :" # debug_show (response));
		return response;
	};

	// public func getFile ({ id : Text }) :async OutputTypes.GetFileOutputType {

	// 	let response = Get.getFile({
	// 		d3;
	// 		getFileInput = {
	// 			fileId = id;
	// 		};
	// 	});
	// 	Debug.print("upload chunk response :" # debug_show (response));
	// 	return response;
	// };

	public query ({ caller }) func http_request(httpRequest : D3.HttpRequest) : async D3.HttpResponse {

		D3.getFileHTTP({ d3; httpRequest; httpStreamingCallbackActor = this });
	};

	public query ({ caller }) func http_request_streaming_callback(streamingCallbackToken : D3.StreamingCallbackToken) : async D3.StreamingCallbackHttpResponse {

		D3.httpStreamingCallback({ d3; streamingCallbackToken });
	};
};
