# Changelog

## Next release

- Fix bug that caused create OTA release button to be in loading state forever.
- Fix invalid format of OTA releases for SDKs.
- Fix bug where issues would not be created/resolved when updating an already existing translation.
- Fix editor site filter options styling.
- Make colors more consistent by reducing the number of different colors.

## 1.2.1

- Make tags feature available for free.
- Add support to skip empty plural translations during export.
- Add possibility to deactivate users at instance, organization and project level.
- Create a new organization for projects without organization and make the organization required.
- Remove uniqueness of export config name per project.

## v1.2.0

- Add WordPress integration.
- Add new sidebars for easier navigation.
- Add .arb import/export.
- Add .yaml import/export
- Add info to instance licenses when they are expired.
- Add forbidden words.
- Add placeholder checks.
- Add validations.
- Add issues system.
- Add tags.
- Add plural support.
- Improve design and adjust colors.
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
- Fix bug that caused some keys not to be deleteable.
- Fix bug that caused some projects not to be deleteable and improve delete performance.
- Fix bug that caused machine translation site to crash.
- Fix bug where HTML editor content is empty when editing after importing translations.
- Fix bug if imported licenses are invalid.
- Fix invalid import/export of Ruby on Rails translation files.
- Fix bug when creating translations in parallel that would result in multiple issues.

## v1.0.6

- Fix machine translation bug for existing translations.

## v1.0.5

- Fix machine translation of a language not working for team plans.

## v1.0.4

- Add support for custom HTTP proxy for DeepL calls via `http_proxy_deepl`.

## v1.0.3

- New proxy support via `http_proxy` env variable
