# Changes for next release

- Added flavors. Flavors are an extension to export configs which let you explicitly define how you can overwrite translations. Export configs are now soley there to define the format of your exported translations and don't automatically allow to override translations. You can now export your overwritten translations in multiple formats.

- Added tags filter. This allows to filter keys based on tags on the keys and editor site.

- Fixed a bug which caused the HTML translation content to be saved as ```<p><br></p>``` or ```<p></p>``` even if there is no content. This caused the untranslated filter to not work. We removed all ```<p><br></p>``` and ```<p></p>``` content.

- Redesigned sub sidebars.

- Added new import system.

- Refactor import system with background jobs and an all new import flow.
