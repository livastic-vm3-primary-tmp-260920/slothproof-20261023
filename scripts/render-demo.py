#!/usr/bin/env python3
"""Render ONLY actual cached MiniLM CLI demo rows, never fictitious income."""
import json
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
report = json.loads((ROOT / "docs" / "model-demo.json").read_text(encoding="utf8"))
assert report["model_inference_ran"] is True
assert report["earnings_verified_by_this_tool"] == 0
assert len(report["ranked"]) == 8

FONT = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
BOLD = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
font = lambda n, bold=False: ImageFont.truetype(BOLD if bold else FONT, n)
W,H=1440,970
im=Image.new("RGB",(W,H),"#10151f")
d=ImageDraw.Draw(im)
d.rounded_rectangle((46,42,W-46,H-35),35,fill="#1b2432",outline="#40516a",width=2)
d.text((86,78),"SLOTHPROOF",font=font(56,True),fill="#adf0cb")
d.text((90,151),"Local open-weight semantic screening · October 23, 2026",font=font(22),fill="#b4c4d9")
d.rounded_rectangle((86,208,1354,305),22,fill="#253449")
d.text((116,223),"8 invented listings",font=font(26,True),fill="white")
d.text((610,223),"MiniLM local inference: TRUE",font=font(26,True),fill="#adf0cb")
d.text((116,265),"Independent funded buyer verification: NONE",font=font(19),fill="#fbd593")
d.text((798,265),"Real earnings from this demo: 0 USDC",font=font(19),fill="#fbd593")
d.text((86,346),"SOURCE TEXT                 SEMANTIC CLASS                         POLICY CHECK",font=font(20,True),fill="#9fb2cd")
for i,row in enumerate(report["ranked"]):
  y=390+i*58
  if i%2==0:d.rounded_rectangle((80,y-3,1350,y+54),13,fill="#202d3e")
  ident=row["id"]
  cat=row["semantic"]["top"]["category"]
  sim=row["semantic"]["top"]["similarity"]
  flagged=[s for s in row["reasons"] if s!="NO_INDEPENDENT_FUNDING_PROOF"]
  reason = ", ".join(flagged).replace("_"," ").lower() if flagged else "Unverified payer (always)"
  d.text((99,y+8),ident,font=font(22,True),fill="#edf1f6")
  d.text((455,y+8),cat+"  "+str(round(sim*100))+"%",font=font(21),fill="#a9e1c6")
  if len(reason)>38:reason=reason[:35]+"…"
  d.text((857,y+8),reason,font=font(19),fill="#f4c98c" if flagged else "#b4c4d9")
d.line((87,895,1350,895),fill="#435169",width=2)
d.text((91,913),"DEMO IS SYNTHETIC · NO WALLET, NO TRANSFERS, NO PAID ORDERS",font=font(18,True),fill="#aebed2")
out=ROOT/"docs"/"demo.png"
im.save(out,optimize=True)
print(out, im.size, out.stat().st_size)
