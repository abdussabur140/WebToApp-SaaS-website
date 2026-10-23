# WebToApp website

A static, multi-page marketing site built with HTML, CSS, JavaScript, and SVG. No build step, no framework, no npm.

## Structure

- `index.html`: homepage. Hero with website address check, website platform examples, problem and solution, three-step workflow, capabilities (Core vs Confirm), project-setup example, responsive-website guidance, use cases, transparency points, pricing preview, FAQ, and final call to action.
- `features.html`: features page. Approach, core capabilities, app customization, navigation and experience, device-integration requirements table, release path, and CTA.
- `pricing.html`: Starter $19, Growth $49, and Scale $99 per month, a plan comparison table, how conversion works, pricing FAQ, and CTA.
- `assets/theme.css`: the entire design system. Tokens live in `:root` (colour, type scale, spacing, radii). Sections are numbered and documented at the top of the file.
- `assets/script.js`: mobile navigation (open, close on link, Escape) and local website address validation. It makes no network requests and does not submit the address or start app setup.
- `assets/icons/`: SVG icons. `*-ink.svg` variants are for light surfaces; `*-white.svg` and `icon-arrow-light.svg` are for dark surfaces. `favicon.svg` is the site icon.
- `assets/marquee/`: platform and technology logos used in the homepage strip.
- `assets/images/`: illustrative SVG images. The hero no longer uses `hero-dashboard.svg`; the other images are used on the homepage (see notes below).

## Running locally

Open `index.html` in a browser, or serve the folder:

    python3 -m http.server 8000

## Hero animation

The right side of the homepage hero is a CSS-and-JavaScript animation of the flow from website to Android and iOS app previews. It is not a video or image.

- Timing: one 10-second cycle (`--cycle` in `.flow-demo`), with keyframes in `assets/theme.css` under "HERO: split layout and website-to-app animation". Percentages map to scenes: website 0-16%, conversion 16-46%, phones 38-60%, completion 60-86%, reset 86-100%.
- Structure: the composition is a fixed 600x520 stage built from HTML and CSS elements (`.fd-browser`, `.fd-panel`, `.fd-phone--a`, `.fd-phone--i`, `.fd-complete`) and two SVG connection paths. `script.js` scales it to its container through `--fd-scale` and pauses it when the hero is off-screen or the tab is hidden.
- Content: the browser site and app screens use a fictional business ("Maple & Oak"). The panel text says "Visual demonstration only." Do not change it to imply a real build or publish step.
- Reduced motion: `prefers-reduced-motion` shows a static composition with every element in its final state.
- To retime the scenes, edit the keyframe percentages. To change the content, edit the markup inside `.flow-demo`.

## Design notes

- Colours: warm off-white background, near-black text, beige surfaces, dark sections, and a yellow accent used sparingly for primary actions and highlights.
- Type: Source Serif 4 for display headings and Inter for body text, both loaded from Google Fonts. Fallbacks are Georgia and the system UI font.
- Feature status: every capability is labelled Core (part of the WebView approach) or Confirm (depends on the website, platform, permissions, or plan). Keep those labels accurate when the product changes.
- Pricing: prices are preserved. Inclusions that have not been published are shown as "To be confirmed" or "Not yet specified." Replace them only with confirmed information.

## Notes on the images

- Icons and logos are vector SVG.
- The hero dashboard, editor, responsive-devices, and showcase phone images are rendered concepts. Vector SVG cannot represent them faithfully, so each file embeds the original raster image data. They are captioned as illustrative concepts. They show invented brand names and purple styling, so replace them with real WebToApp screenshots before launch.
- `assets/images/avatar-*.svg` and `logo-*.svg` are not used by the current pages. Keep them only if you plan to use them again.
- The platform wordmarks in `assets/marquee/` are examples. They do not indicate partnerships, endorsements, or verified integrations.

## Open items

- Login: the header shows a disabled "Login" label. Replace it with a link once accounts exist.
- Pricing CTAs and the header "Get started" button link to the homepage address check. Connect them to checkout or a sales route when one exists.
- Footer and header: there are no legal, careers, press, or documentation pages yet. Add links only when the destinations exist.
- Set the canonical URL and final Open Graph URL once the production domain is known.
- Connect the website address form to a real setup flow when one exists. It currently validates the format only.
- Replace the illustrative images with WebToApp screenshots.
- Testimonials and customer logos have been removed. Add them back only with verified customers and written permission.
