# AutoNPC PlayerAI v2.0 — Minecraft Bedrock Add-on

AutoNPC PlayerAI, Minecraft Bedrock için geliştirilen modüler otonom NPC add-on prototipidir.

## Sürüm

**v2.0**

Bu repoda sürüm adı dosya ve paket isimlerinde özellikle yazılır. Yeni değişikliklerde sürüm numarası artırılmalıdır.

## Klasör yapısı

```text
behavior_pack/   # Script API, entity, item, recipe ve function kaynakları
resource_pack/   # Model, animation, language ve render kaynakları
tools/           # Paket/kaynak senkron kontrol yardımcıları
```

## Kurulum

En kolay kurulum:

1. `AutoNPC_PlayerAI_v2_0_AllInOne.mcaddon` dosyasını indir.
2. Dosyayı Minecraft ile aç.
3. Dünya ayarlarında hem Behavior Pack hem Resource Pack'i aktif et:
   - `AutoNPC PlayerAI v2.0 BP`
   - `AutoNPC PlayerAI v2.0 RP`
4. Dünya açıldığında yönetim kitabı gelmelidir.
5. Kitap gelmezse chat'e şunu yaz:

```text
npc kitap
```

## Temel kullanım

```text
npc test
npc kitap
npc işçi
npc panel
npc odun
npc blok minecraft:stone 16
npc demir
npc elmas
npc yürü
npc oto
npc durum
```

## Özellikler

- Modüler Script API yapısı
- AutoNPC yönetim kitabı
- NPC görev paneli
- Odun toplama
- Herhangi blok toplama emri
- Taş, demir, elmas ve diğer maden görevleri
- Basit oyuncu zekâsı / otomatik mod
- NPC durum ve test komutları
- Behavior Pack + Resource Pack tek `.mcaddon` release dosyası

## Geliştirme notu

Ana script girişi:

```text
behavior_pack/scripts/main.js
```

Modüller:

```text
behavior_pack/scripts/modules/
```

Resource Pack bağlantıları:

```text
resource_pack/entity/worker.entity.json
resource_pack/models/entity/worker.geo.json
resource_pack/render_controllers/worker.render_controllers.json
```

Not: PNG ve `.mcaddon` gibi binary varlıklar PR incelemesini bozmasın diye yeni kaynak diffine eklenmez; kurulum paketlerinin içinde korunur.

## Bilinen Bedrock sınırları

Bu bir Java/Fabric/Forge modu değildir. Baritone, Java `GoalSelector` veya Fabric API kullanmaz. Bedrock tarafında Behavior Pack + Resource Pack + Script API mantığıyla çalışır.

## Release

Kurulabilir dosya:

```text
AutoNPC_PlayerAI_v2_0_AllInOne.mcaddon
```
