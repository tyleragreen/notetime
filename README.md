# Notetime
[![Circle CI](https://circleci.com/gh/tyleragreen/notetime.svg?style=svg)](https://circleci.com/gh/tyleragreen/notetime)

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
  "description": "A notebook's description",
  "timelines": [
    "fare-increases",
    "expansion"
  ]
}
```

## Tags

| Tag | Description |
|------|-----|
title|The note's title
tags|A space-separated list of tags
date| 
source| 
source-id| 
source-title| 
source-date| 
source-url| 
source-publication| 
source-author| 
source-pages| 
source-institution| 

## Source Formats

- "Title," *Publication*, Date. [link](#url)
- Author, "Title," *Publication*, Date. [link](#url)
- "Title," *Institution*, Date. [link](#url)
- [id](#url)

### Simple vs Complex Sources

A simple source has the format
```
; source <id> <url>
```
A complex source has the format
```
; source-id <id>
```
and can be any of the `source-*` or `<integer-identifier>-source-*` tags in the table above.

## Timelines

A timeline is a list of notes of a particular tag sorted by date. Notetime will attempt to sort a note using the following fall-through logic:

1. The `date` tag, if one exists.
2. The `source-date` tag, if one exists, and no `*-source-date` tags exist.
4. If neither of these are found, the note will go into an `Undated Notes` at the bottom of the timeline.
