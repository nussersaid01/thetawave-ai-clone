import sys
import sqlite3
import os
import glob
import json

def main():
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No ID provided"}))
        return

    target_id = sys.argv[1].strip()
    db_paths = glob.glob(os.path.expandvars(r"%LOCALAPPDATA%\Google\DriveFS\*\metadata_sqlite_db"))
    if not db_paths:
        print(json.dumps({"found": False, "reason": "No DriveFS database located"}))
        return

    conn = sqlite3.connect(f"file:{db_paths[0]}?mode=ro", uri=True)
    c = conn.cursor()

    # Query stable_ids
    s_row = c.execute("SELECT stable_id FROM stable_ids WHERE cloud_id = ?", (target_id,)).fetchone()
    if not s_row:
        print(json.dumps({"found": False, "reason": "ID not found in stable_ids"}))
        return

    stable_id = s_row[0]
    item_row = c.execute("SELECT local_title, file_size, mime_type, is_folder FROM items WHERE stable_id = ?", (stable_id,)).fetchone()
    if not item_row:
        print(json.dumps({"found": False, "reason": "Item metadata missing"}))
        return

    local_title, file_size, mime_type, is_folder = item_row
    result = {
        "found": True,
        "local_title": local_title,
        "file_size": file_size,
        "mime_type": mime_type,
        "is_folder": bool(is_folder)
    }

    if is_folder:
        children_query = """
            SELECT i.local_title, i.file_size, i.mime_type, s.cloud_id 
            FROM items i 
            JOIN stable_parents p ON i.stable_id = p.item_stable_id 
            JOIN stable_ids s ON i.stable_id = s.stable_id 
            WHERE p.parent_stable_id = ?
        """
        children = []
        for r in c.execute(children_query, (stable_id,)).fetchall():
            children.append({
                "name": r[0],
                "size": r[1],
                "mimeType": r[2],
                "id": r[3]
            })
        result["folderChildren"] = children

    print(json.dumps(result))

if __name__ == '__main__':
    main()
