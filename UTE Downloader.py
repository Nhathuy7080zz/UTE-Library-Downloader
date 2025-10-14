import urllib.request
import base64
import re
import os
from datetime import datetime

def download_pdf(url, app_key, output_filename=None):
    """
    Tải PDF từ URL với APP_KEY
    
    Args:
        url: URL của tài liệu PDF
        app_key: APP_KEY để xác thực
        output_filename: Tên file output (không bắt buộc)
    """
    headers = {'APP_KEY': app_key}
    
    print(f'\n📥 Đang tải tài liệu từ: {url[:60]}...')
    
    try:
        # Tạo request với headers
        req = urllib.request.Request(url, headers=headers)
        
        # Tải dữ liệu
        with urllib.request.urlopen(req) as response:
            data = response.read().decode('utf-8')
        
        # Xóa prefix từ dữ liệu base64 (nếu có)
        base64_data = re.sub(r'#excRCQWQP.*?b', '', data)
        
        # Decode base64 thành PDF
        pdf_data = base64.b64decode(base64_data)
        
        # Tạo tên file output nếu chưa có
        if not output_filename:
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            output_filename = f'document_{timestamp}.pdf'
        
        # Đảm bảo có đuôi .pdf
        if not output_filename.endswith('.pdf'):
            output_filename += '.pdf'
        
        # Lưu file PDF
        with open(output_filename, 'wb') as f:
            f.write(pdf_data)
        
        print(f'✅ Tải thành công!')
        print(f'📄 File: {output_filename}')
        print(f'💾 Dung lượng: {len(pdf_data) / 1024 / 1024:.2f} MB')
        print(f'📁 Đường dẫn: {os.path.abspath(output_filename)}')
        return True
        
    except urllib.error.HTTPError as e:
        print(f'❌ Lỗi HTTP {e.code}: {e.reason}')
        print('   Kiểm tra lại URL hoặc APP_KEY')
        return False
    except urllib.error.URLError as e:
        print(f'❌ Lỗi kết nối: {e.reason}')
        return False
    except Exception as e:
        print(f'❌ Lỗi không xác định: {str(e)}')
        # Lưu dữ liệu thô để debug
        try:
            with open('error_log.txt', 'w', encoding='utf-8') as f:
                f.write(f'Error: {str(e)}\n')
                f.write(f'Data length: {len(data) if "data" in locals() else 0}\n')
                if 'data' in locals():
                    f.write(f'First 500 chars: {data[:500]}')
            print('   Đã lưu log lỗi vào error_log.txt')
        except:
            pass
        return False

def main():
    print('='*60)
    print('📚 CÔNG CỤ TẢI TÀI LIỆU PDF')
    print('='*60)
    
    while True:
        print('\n' + '-'*60)
        
        # Nhập URL
        print('\n🔗 Nhập URL tài liệu:')
        print('   (hoặc gõ "quit" để thoát)')
        url = input('   > ').strip()
        
        if url.lower() in ['quit', 'exit', 'q']:
            print('\n👋 Tạm biệt!')
            break
        
        if not url:
            print('⚠️  URL không được để trống!')
            continue
        
        # Nhập APP_KEY
        print('\n🔑 Nhập APP_KEY:')
        print('   (nhấn Enter để dùng key mặc định)')
        app_key = input('   > ').strip()
        
        # Dùng key mặc định nếu không nhập
        if not app_key:
            app_key = '5fe9236f9bcd0a4e3e2ebefccc300199'
            print(f'   ℹ️  Sử dụng key mặc định: {app_key}')
        
        # Nhập tên file output (không bắt buộc)
        print('\n📝 Nhập tên file output (không bắt buộc):')
        print('   (nhấn Enter để tự động đặt tên)')
        output_filename = input('   > ').strip()
        
        # Tải tài liệu
        success = download_pdf(url, app_key, output_filename if output_filename else None)
        
        # Hỏi có tiếp tục không
        print('\n' + '-'*60)
        print('📌 Tải thêm tài liệu khác? (y/n)')
        choice = input('   > ').strip().lower()
        
        if choice not in ['y', 'yes', 'có', 'c']:
            print('\n👋 Tạm biệt!')
            break

if __name__ == '__main__':
    main()
