# Notetime

Notetime is a Markdown-based light-weight note-taking tool.

## Features

- Custom tagging of notes
- Timeline creation for particular tags
- Always-published notes
- Integration with [GitBooks](https://gitbooks.com)

## Configuration

A notebook is configured using `.noterc`, like the following example.

```
{
  "title": "Urban History",
  "description": "I'm studying urban history and these are my notes. Focus will be placed on all financial aspects, particularly those of New York City and the [Metropolitan Transportation Authority](http://www.mta.info).",
  "timelines": [
    "fare-increases",
    "expansion"
  ]
}
```

## Tags

------|
title|
tags|
date|
source-id|
source-title|
source-date|
source-publication|
source-url|
use-source|

## Timelines

A timeline is a list of notes of a particular tag sorted by date. Notetime will attempt to sort a note using the following fall-through logic:

1. The `date` tag, if one exists.
2. The `source-date` tag, if one exists, and no `*-source-date` tags exist.
3. The `*-source-date` tag specified by a `use-source *` tag.
4. If none of these are found, the note will go into an `Undated Notes` at the bottom of the timeline.
