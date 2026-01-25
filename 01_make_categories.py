import json

# 这里是你提供的分类数据
raw_text = """
Horizontal Orbital Stretch Wrapper
ID: 119
Semiauto horizontal wrapper
ID: 120
Automatic horizontal stretch wrapper
ID: 121
Customize orbital wrapper
ID: 122
Stretch Wrapping Machine
ID: 123
Semi-auto pallet wrapping machine
ID: 124
Automatic pallet wrapping machine
ID: 126
Rotary arm wrapping machine
ID: 127
Rotary ring stretch wrapping machine
ID: 129
Automatic Strapping Machine
ID: 345
Automatic PET Strapping Machine
ID: 390
Steel coil strapping machines
ID: 346
Steel tube strapping machine
ID: 347
Steel wire strapping machine
ID: 348
Shrink Wrap Machine
ID: 272
L-Bar Shrink Wrap Machine
ID: 273
Side Seal Shrink Wrap Machine
ID: 274
Shrink Bundling Machine
ID: 280
Horizontal Flow Shrinking Machine
ID: 282
Automatic Shrink Wrapping Machine
ID: 281
Pallet Inverter
ID: 250
Stationary Pallet Inverter
ID: 300
Mobile Pallet Changer
ID: 299
Pallet Changer
ID: 301
Inline Pallet Changer
ID: 344
Automatic Coler
ID: 172
Vertical Automatic Coler
ID: 174
Horizontal Automatic Coler
ID: 173
Automatic Cable Coler
ID: 259
Coil Packing Machine
ID: 139
Hose packaging machine
ID: 152
Steel coil wrapping machine
ID: 141
Wire coil wrapping machine
ID: 142
Copper coil packing machine
ID: 143
Pipe packing machine
ID: 144
Cable packing machine
ID: 145
Bearing packing machine
ID: 169
Aluminum Coil Packaging Machine
ID: 363
Tyre packing machines
ID: 153
Automatic Steel Tube Packing Line
ID: 138
Automatic Coil Packing Line
ID: 136
Slit Coil Packing Line
ID: 395
Automatic Packing Line
ID: 135
Master Steel Coil Stretch Wrapper
ID: 247
Plastic Pipe Packing Line
ID: 246
Aluminum profile packing line
ID: 266
Automatic Wire Packing Line
ID: 297
Copper Coil Packing Line
ID: 365
Automatic Rod Packing Line
ID: 377
Auto Bagger
ID: 353
Table Roll Auto Bagger
ID: 354
Horizontal auto bagger
ID: 355
Upender
ID: 131
Mechanical upender
ID: 132
Hydraulic upender
ID: 134
Hydraulic Dumper
ID: 367
Mold upender
ID: 369
Mold Flipper
ID: 370
Coil Upender
ID: 385
Show Room
ID: 245
Upenders
ID: 248
Pallet Flipping Machine
ID: 376
Mold Separator
ID: 373
Box Wrapper
ID: 374
Pallet feeding machine
ID: 378
Horizontal Stretch Wrapper
ID: 379
Coil Tilter
ID: 380
Upender Machine
ID: 381
Coil Turner
ID: 384
Coil Tippers
ID: 387
Coil Wrapping Machine
ID: 366
Pallet Inverter Machines
ID: 368
Orbital Stretch Wrapper Cases
ID: 249
Pallet Exchanger
ID: 382
Wooden & board packing solution
ID: 268
Door Packing Machine
ID: 275
Coil Packing Line Showcase
ID: 276
Tube & Pipe packing line
ID: 290
Steel Industry Packaging
ID: 342
Autobag
ID: 357
Automatic Wire Winding and Packing Machine
ID: 356
Steel Sheet Lifter
ID: 389
Markets
ID: 2
Aluminum packing solution
ID: 171
Panel Packing Solution
ID: 258
Automatic coiling and strapping machine
ID: 278
Pallet Inverter
ID: 279
Wire Packing Solutions
ID: 296
Board Packing Solutions
ID: 364
Industry Machines
ID: 284
Shrinking solution
ID: 285
Automatic collar solution
ID: 286
Pallet Handling
ID: 287
Tissue packing machine
ID: 289
Thermic Boxes Packing Machine
ID: 291
Plate & Cup packing machine
ID: 292
Other
ID: 295
"""

def main():
    lines = raw_text.strip().split('\n')
    category_map = {}
    current_name = ""
    for line in lines:
        line = line.strip()
        if not line: continue
        
        if line.startswith("ID:"):
            cat_id = line.split(":")[1].strip()
            category_map[cat_id] = current_name
        else:
            current_name = line

    # 保存
    with open('categories.json', 'w', encoding='utf-8') as f:
        json.dump(category_map, f, indent=2, ensure_ascii=False)
        
    print(f"✅ 分类字典已生成！包含 {len(category_map)} 个分类。")

if __name__ == "__main__":
    main()