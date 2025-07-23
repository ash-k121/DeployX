# remove-blob.py
def blob_callback(blob, metadata):
    if blob.id.hex() == "613bfb05960c69bf242ee986dfeceb5d092abe24":
        blob.skip()
