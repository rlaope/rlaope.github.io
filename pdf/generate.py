#!/usr/bin/env python3
"""Generate a dark-themed link card PDF for rlaope."""

import os
from fpdf import FPDF

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ROOT_DIR = os.path.dirname(BASE_DIR)
LOGO_PATH = os.path.join(ROOT_DIR, "rlaopelogo.png")
OUTPUT_PATH = os.path.join(BASE_DIR, "rlaope.pdf")

# Load JetBrains Mono if available, otherwise fall back
FONT_DIR = os.path.join(BASE_DIR, "fonts")


class LinkCardPDF(FPDF):
    def __init__(self):
        super().__init__(orientation="P", unit="mm", format="A4")
        self.set_auto_page_break(auto=False)

    def build(self):
        self.add_page()
        w, h = 210, 297  # A4

        # Full black background
        self.set_fill_color(0, 0, 0)
        self.rect(0, 0, w, h, "F")

        # --- Card dimensions ---
        card_w, card_h = 140, 160
        card_x = (w - card_w) / 2
        card_y = (h - card_h) / 2 - 10

        # Card background (very subtle dark gray)
        self.set_fill_color(12, 12, 12)
        self.rect(card_x, card_y, card_w, card_h, "F")

        # Card border (subtle)
        self.set_draw_color(40, 40, 40)
        self.rect(card_x, card_y, card_w, card_h, "D")

        # --- Logo ---
        logo_size = 28
        logo_x = (w - logo_size) / 2
        logo_y = card_y + 20
        if os.path.exists(LOGO_PATH):
            self.image(LOGO_PATH, logo_x, logo_y, logo_size, logo_size)

        # --- "rlaope" name ---
        self.set_font("Helvetica", "B", 22)
        self.set_text_color(232, 232, 232)  # --text: #e8e8e8
        name_y = logo_y + logo_size + 12
        self.set_xy(card_x, name_y)
        self.cell(card_w, 10, "rlaope", align="C")

        # --- "Software Engineer" ---
        self.set_font("Helvetica", "", 11)
        self.set_text_color(136, 136, 136)  # --accent: #888
        role_y = name_y + 12
        self.set_xy(card_x, role_y)
        self.cell(card_w, 8, "Software Engineer", align="C")

        # --- Divider line ---
        div_y = role_y + 18
        self.set_draw_color(50, 50, 50)
        self.line(card_x + 30, div_y, card_x + card_w - 30, div_y)

        # --- Link button ---
        btn_w, btn_h = 100, 14
        btn_x = (w - btn_w) / 2
        btn_y = div_y + 12

        # Button background
        self.set_fill_color(232, 232, 232)  # white-ish button
        self.set_draw_color(232, 232, 232)
        # Rounded rect (using rect for simplicity, fpdf2 supports round_corners)
        self.rect(btn_x, btn_y, btn_w, btn_h, "FD")

        # Button text
        self.set_font("Helvetica", "B", 10)
        self.set_text_color(0, 0, 0)
        self.set_xy(btn_x, btn_y)
        self.cell(btn_w, btn_h, "rlaope.github.io", align="C",
                  link="https://rlaope.github.io")

        # Make the entire button area clickable
        self.link(btn_x, btn_y, btn_w, btn_h, "https://rlaope.github.io")

        # --- Small hint text below button ---
        self.set_font("Helvetica", "", 7)
        self.set_text_color(80, 80, 80)
        hint_y = btn_y + btn_h + 6
        self.set_xy(card_x, hint_y)
        self.cell(card_w, 5, "Click to view full portfolio", align="C")

        # --- Bottom watermark ---
        self.set_font("Helvetica", "", 7)
        self.set_text_color(40, 40, 40)
        self.set_xy(0, h - 15)
        self.cell(w, 5, "Hope Kim  |  piyrw9754@gmail.com  |  github.com/rlaope", align="C")


if __name__ == "__main__":
    pdf = LinkCardPDF()
    pdf.build()
    pdf.output(OUTPUT_PATH)
    print(f"PDF generated: {OUTPUT_PATH}")
