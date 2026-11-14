# E-Pharmacy interface reproduction spec

Source design: [E-PHARMACY Figma file](https://www.figma.com/design/pwRXd2xSEHFLUWNbWYxTVT/E-PHARMACY--clients---Copy-?node-id=0-1&p=f&t=z2XLwQ1uKMdFEFEb-0)

This specification describes the visible Figma screens and their shared visual system. Treat the Figma frames as the visual source of truth. Use real Figma-exported assets in their original slots; do not use a screenshot of a full frame as an implementation asset.

## Design system

- Canvas: very light cool gray `#F7F8FA`.
- Main brand green: `#59B17A`; use it for the hero, primary buttons, active navigation, icons and footer.
- Main text: charcoal `#1D1E21`; supporting text: muted gray `#93939A`.
- Cards are white or pale mint `#E7F1ED`, with thin light-gray borders, soft shadows and rounded corners around 24–28 px.
- Typography is Inter. Major page titles are semibold; body copy is regular. Use compact 12–16 px labels and 20–40 px section titles as indicated by the frames.
- Buttons are pill shaped, green with white text when primary, and pale/outlined for secondary actions. Inputs are white, pill-shaped, thin outlined, and low-contrast placeholder text.
- Status labels use pale green with green uppercase text for OPEN and pale pink/red with red uppercase text for CLOSE. Ratings use a small yellow star and a numeric score.
- Reuse the Figma logo, pill/product imagery, store map-pin and phone icons, cart, star, social SVGs, and decorative shapes. Never leave short-lived Figma asset URLs as runtime URLs; save each used asset locally and reference it from the app.

## Shared site header and footer

On standard shop pages, use a header on the light canvas: E-Pharmacy logo at the left, a centered segmented pill navigation (`Home`, `Medicine store`, `Medicine`) with the selected item filled green, and cart/count, user indicator and `Log out` controls at the right for an authenticated user. Public/auth screens instead use the logo at the upper left and no shop navigation in the shown frame. At narrow widths, collapse navigation into the hamburger menu and use the provided menu states.

The shared footer is a full-width brand-green block. Its upper row has the white logo and short product promise at left, navigation around the center, and Facebook, Instagram and YouTube icons on the right. A fine divider separates a centered bottom row containing copyright, `Privacy Policy` and `Terms & Conditions`.

## Home page, desktop 1440 × 3478

1. **Hero, 1440 × 800:** full-width green background. Header sits near the top with white logo, a white segmented navigation pill and light outlined Register / Login actions. Center the large capsule photograph in the hero. Overlay the two-line white headline `Your medication delivered` across the image, with the smaller supporting sentence `Say goodbye to all your healthcare worries with us` near its lower-right area.
2. **Promotion strip:** three equal white cards in one row, each with a numbered green circle, title and large offer: `Huge Sale — 70%`, `Secure delivery — 100%`, `Off — 35%`. Put the relevant small text link at the lower right of each card.
3. **Nearest stores:** centered heading and muted subtitle, then six pale-mint store cards in a 3 × 2 grid. Each card has store name, map-pin/address and phone on the left, rating and OPEN/CLOSE chips at the top right, plus subtle diagonal mint decorations cropped into the background.
4. **Pharmacy callout:** broad rounded pale/green section with left-aligned title `Add the medicines you need online now`, short description and small outlined CTA; place the pharmacy/customer image in the right half with a curved or clipped left edge.
5. **Feature list:** one horizontal row of five compact green-icon labels: `Take user orders form online`, `Create your shop profile`, `Manage your store`, `Get more orders`, `Storage shed`.
6. **Reviews:** centered `Reviews` heading and subtitle, then three white review cards in a row. Each has a circular avatar overlapping the top edge, centered customer name and small muted testimonial copy.
7. Finish with the shared footer.

## Stores page

Use the shared light header with `Medicine store` selected. Place the `Medicine store` title below it. Show nine visible cards in a 3-column grid with generous row spacing. Each pale-mint card has name, address on two lines with a green map-pin, phone with a green handset, green `Visit Store` pill, star and rating, and OPEN/CLOSE chip. Use subtle diagonal mint decoration in the top-right of each card. Keep the green shared footer at the bottom.

## Medicine catalog

Use the shared header with `Medicine` selected and a page title. Below it place a category dropdown, search field with magnifier, and green `Filter` button on one line. Render up to 12 product cards per page, four columns on desktop. Each card has a large square-ish image panel with thin green outline and rounded top corners, product photo centered with `contain`, then a white information panel with product name, price aligned opposite, small muted supplier/description text, green `Add to cart` button and small `Details` link. Place pagination beneath the grid only when the API reports more than one page. The Figma includes a separate pagination state/frame.

## Product details

Below the shared header, use a two-column layout. Left column: large product image in a rounded square with a thin green outline; below it a white compact panel with product title and price, small supplier/brand line, quantity stepper, and green `Add to cart` button. Right column: a large white rounded panel with green active `Description` pill and pale-mint `Reviews` pill. Description content uses several readable paragraphs and bold lead-ins. The Reviews tab uses author, date, text and star rating rows, with pagination for many reviews.

## Cart

Use the shared header and a `Cart` page heading. Desktop content has two columns. The left white rounded panel contains `Enter shipping info`, a brief instruction, four labeled inputs in a 2 × 2 grid (Name, Email, Phone, Address), divider, payment method description with radio choices `Cash On Delivery` and `Bank`, another divider, `Order details`, explanatory cost note, pale-mint Total bar and green `Place order` button. The right side lists cart items: rounded square thumbnail, item name and short descriptor, unit price, quantity stepper and red/pale-red `Remove` action; separate rows with a fine divider. Keep generous whitespace and the shared footer.

## Register and login

Auth pages use the light-gray canvas, logo alone at the upper left, no standard header/footer. Desktop composition is split: left side has a very large four-line dark headline `Your medication, delivered Say goodbye to all your healthcare worries with us`, with `your healthcare` highlighted green. Place the oversized tablet image partly overlapping the headline near the top. On the right, arrange white pill-shaped inputs. Registration uses a 2 × 2 grid for User Name, Email address, Phone number and Password, followed by a wide green Register button and small `Already have an account?` link. Login has vertically stacked Email address and Password inputs, wide green `Log in` button and `Don't have an account?` link. Large pale-mint diagonal pill decorations enter from the lower-right edge.

## Responsive layouts and menu states

Figma contains 1440 px desktop, 768 px tablet and 375 px mobile frames, plus mobile menu and logged-out menu states. Follow those frames rather than scaling desktop screenshots. At tablet, retain the brand and segmented navigation where shown; reflow grids and forms to available width. At mobile, show a compact header with logo and hamburger, stack the home sections vertically, make store cards and product cards one column, stack product detail and cart columns, and keep inputs/buttons comfortably tappable. The mobile catalog is a single vertical list of image-first product cards; the home promotion cards and pharmacy/review sections also stack vertically. Preserve the same green/mint palette, Inter typography and rounded surfaces. The base layout must remain usable from 320 px.

## Behavior and source-data mapping

- Use the JSON data as seed/API data, not as additional design instructions. Product `photo` populates catalog/detail/cart images; pharmacy records populate store cards; `reviews.json` populates the home testimonials.
- Figma has three home reviews, six nearest-store cards and nine store-list cards visible. Use API records for content and select the requested count; do not hardcode screenshot names over live data.
- Figma shows a Taka currency marker. Keep the project currency configurable and format prices consistently; do not silently reinterpret numeric values.
- Search, category filter, pagination, quantity steppers, navigation, cart, tabs, form validation, login/register and checkout must work. A guest who tries to add to cart sees the login/register dialog state.
- The Figma design contains menu and auth popup states; implement them as accessible dialogs/drawers with keyboard dismissal, focus handling and responsive sizing.
- If a visible asset is missing or fails to load, show a deliberate neutral fallback that preserves its layout slot. Do not substitute unrelated temporary images.
