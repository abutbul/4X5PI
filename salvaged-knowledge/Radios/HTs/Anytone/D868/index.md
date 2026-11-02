---
title: AnyTone AT-D868UV
nav_title: AT-D868UV
nav_key: d868
parent: anytone
theme_key: knowledge
nav_order: 1
description: User guides, programming references, APRS notes, and firmware documents for the AnyTone AT-D868UV.
---

## About this collection

I have collected some user guides in Hebrew that were provided to me when I purchased this radio, along with programming, APRS, and firmware references for the AnyTone AT-D868UV. The original documents are preserved below. Where selectable text can be extracted from a PDF, the build also creates a readable page for it; the original PDF remains available to download.

## Files available

{% assign radio_directory = "salvaged-knowledge/Radios/HTs/Anytone/D868/" %}
{% assign model_files = site.static_files | sort: "name" %}
<div class="radio-file-list" markdown="0">
{%- for file in model_files -%}
  {%- if file.path contains radio_directory -%}
    {%- assign extension = file.extname | downcase -%}
    {%- unless file.name contains ":Zone.Identifier" -%}
<div class="radio-file">{%- if extension == ".png" or extension == ".jpg" or extension == ".jpeg" or extension == ".webp" or extension == ".gif" -%}<a class="radio-image-link" href="{{ file.url | relative_url | escape }}" download><img src="{{ file.url | relative_url | escape }}" alt="{{ file.name | escape }}" loading="lazy"></a>{%- endif -%}<div class="radio-file-copy"><h3><a href="{{ file.url | relative_url | escape }}" download>{{ file.name | escape }}</a></h3><p>{{ extension | remove_first: "." | upcase }} · Original file</p>{%- if extension == ".pdf" -%}{%- assign conversions = site.pages | where: "source_pdf_name", file.name -%}{%- for conversion in conversions -%}<a class="conversion-link" href="{{ conversion.url | relative_url }}">Read converted text <span aria-hidden="true">↗</span></a>{%- endfor -%}{%- if conversions.size == 0 -%}<p class="conversion-unavailable">Text conversion unavailable; original PDF is linked above.</p>{%- endif -%}{%- endif -%}</div></div>
    {%- endunless -%}
  {%- endif -%}
{%- endfor -%}
</div>