# Katkı Kuralları

- Kod ve paket kaynaklarında küçük, odaklı değişiklikler yapın.
- JSON dosyalarını geçerli JSON olarak tutun.
- Script dosyalarında modüler yapıyı koruyun.
- PR incelemesi için yeni binary dosya eklemeyin (`.png`, `.mcaddon`, `.zip` vb.). Binary paketler gerekiyorsa mevcut release arşivlerinin içinde tutulmalı veya ayrı release asset olarak yayımlanmalıdır.
- Paket/kaynak senkronunu kontrol etmek için `python3 tools/verify_package_sync.py` çalıştırın.
