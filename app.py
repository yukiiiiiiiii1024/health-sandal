import os
import json
from flask import Flask, request, jsonify, url_for, send_from_directory
from werkzeug.utils import secure_filename

app = Flask(__name__, static_folder='static')

# 設定
DATA_FILE = os.path.join(os.path.dirname(__file__), 'data.json')
UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), 'static', 'images')
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'svg', 'webp'}

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
# ファイルサイズ制限 (16MB)
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024

def load_data():
    if not os.path.exists(DATA_FILE):
        return {}
    with open(DATA_FILE, 'r', encoding='utf-8') as f:
        return json.load(f)

def save_data(data):
    with open(DATA_FILE, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/')
def index():
    # プロジェクトルートにある index.html を読み込む
    root_dir = os.path.dirname(__file__)
    index_path = os.path.join(root_dir, 'index.html')
    
    if not os.path.exists(index_path):
        return "index.html が見つかりません", 404
        
    with open(index_path, 'r', encoding='utf-8') as f:
        html_content = f.read()
        
    # 保存されている最新の JSON データを読み出す
    data = load_data()
    data_json = json.dumps(data, ensure_ascii=False)
    
    # <body> の直前に window.siteData のグローバル変数を注入するスクリプトを差し込む
    script_to_inject = f"""
    <script>
        window.siteData = {data_json};
        console.log("Injected site data from server.");
    </script>
    """
    
    if '</body>' in html_content:
        html_content = html_content.replace('</body>', f'{script_to_inject}</body>')
        
    return html_content

@app.route('/api/save', methods=['POST'])
def save():
    try:
        new_data = request.json
        if not new_data:
            return jsonify({'success': False, 'message': 'データが空です'}), 400
        
        # 既存データをロードし、更新する
        current_data = load_data()
        current_data.update(new_data)
        
        save_data(current_data)
        return jsonify({'success': True, 'message': '保存に成功しました'})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/api/upload', methods=['POST'])
def upload_file():
    try:
        if 'file' not in request.files:
            return jsonify({'success': False, 'message': 'ファイルが見つかりません'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'success': False, 'message': 'ファイルが選択されていません'}), 400
        
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            file.save(filepath)
            
            # クライアント用のパスを返却
            image_url = url_for('static', filename=f'images/{filename}')
            return jsonify({'success': True, 'image_url': image_url})
        
        return jsonify({'success': False, 'message': '許可されていないファイル形式です'}), 400
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

if __name__ == '__main__':
    # 外部ホストからもアクセスできるように設定
    app.run(debug=True, host='0.0.0.0', port=5000)
