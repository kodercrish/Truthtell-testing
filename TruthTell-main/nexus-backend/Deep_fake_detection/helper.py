from pathlib import Path
import hashlib
import tempfile

def compute_file_hash(contents: bytes) -> str:
    return hashlib.sha256(contents).hexdigest()

def save_temp_file(contents: bytes) -> str:
    temp_dir = Path("temp")
    temp_file = tempfile.NamedTemporaryFile(delete=False, dir=temp_dir)
    temp_file.write(contents)
    return temp_file.name
