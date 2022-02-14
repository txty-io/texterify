# Changelog

All notable changes to this project will be documented in this file.

## Next release

- Add WordPress integration.
- Add new sidebars for easier navigation.
- Add .arb import/export.
- Improve design and adjust color.
- Fix character and word count not beeing calculated correctly.
- Fix missing check if auto-translate feature is available.
- Fix bug which caused to only return the first 10 export configs.
- Fix bug where keys site crashes.
- Fix organizations site display errors due to invalid keys.
- Fix missing checks that allowed to create keys with name "texterify_*".
- Fix bug that caused the name and description of a project to not update.
- Fix bug which caused the wrong image for an organization to be shown.
- Fix bug that caused the app to crash when languages are not loaded correctly for filters.
- Fix bug where activity history would crash.
- Fix bug where key history would crash.
- Fix bug where selected target language is not saved when switching beteen keys.

## v1.0.6

- Fix machine translation bug for existing translations.

## v1.0.5

- Fix machine translation of a language not working for team plans.

## v1.0.4

- Add support for custom HTTP proxy for DeepL calls via `http_proxy_deepl`.

## v1.0.3

- New proxy support via `http_proxy` env variable
