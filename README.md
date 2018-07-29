# Notetime
[![Circle CI](https://circleci.com/gh/tyleragreen/notetime.svg?style=svg)](https://circleci.com/gh/tyleragreen/notetime)

Notetime is a Markdown-based light-weight note-taking tool.

## Features

- Always-published notes
- Note tagging
- Timeline creation
- Integration with [GitBooks](https://gitbooks.com)

## Example

This note body

```
; title NYC Subway opens
; tags policy
; date October 27, 1904

The IRT opened on this date.
```
produces this output in `README.md` and `tags/policy.md`

### NYC Subway opens

The IRT opened on this date.
- Date: October 27, 1904
- Tags: [policy](tags/policy.md)

## Command-Line Utilities

`note-new`

Opens a blank file in `vi` at `notes/2018-07-29-14-54-00.md` (or whatever notes path you have configured in your `config.json`.

`note-deploy`

Cleans all generated directories (`tags/` and `timelines`), builds your notes, adds all notes and generated directories to git, makes a new commit, and pushes the commit to your remote.

`note-open <text string to search for>`

Opens the note that includes the `text string to search for`. If it is found in more than one file, script will fail and list out all matching files.

## Configuration

A notebook is configured using `config.json`, like the following example.

```
{
  "title": "Urban History",
  "description": "A notebook's description",
  "timelines": [
    "fare-increases",
    "expansion"
  ],
  "publications": {
    "nyt": "The New York Times",
  }
}
```

## Keywords

A note is composed of a series of keywords and a note body. All keywords should be used on their own line and prefaced with a semicolon. For example:
```
; title A Note's Title
```

| Keyword | Description |
|------|-----|
`title`|The note's title
`tags`|A space-separated list of tags
`date`| 
`source`| 
`*-source-id`| 
`*-source-title`| 
`*-source-date`| 
`*-source-url`| 
`*-source-publication`| 
`*-source-author`| 
`*-source-pages`| 
`*-source-institution`| 

## Source Formats

- "Title," *Publication*, Date. [link](#url)
- Author, "Title," *Publication*, Date. [link](#url)
- "Title," *Institution*, Date. [link](#url)
- Author, "Title", Date, ppPages.
- [id](#url)

### Simple vs Complex Sources

A simple source has the format
```
; source <id> <url>
```
A complex source has the format
```
; 1-source-id <id>
; 1-source-url <url>
; 1-source-title <title>
...
```
and can be any of the `<integer-identifier>-source-*` tags in the table above.

## Timelines

A timeline is a list of notes of a particular tag sorted by date. Notetime will attempt to sort a note using the following fall-through logic:

1. The `date` tag, if one exists.
1. The `*-source-date`, if a single complex source exists for that note.
1. If neither of these are found, the note will go into an `Undated Notes` at the bottom of the timeline.

If your notes tend to have multiple complex sources with dates, they must use a `date` tag to be properly sorted in a timeline.
