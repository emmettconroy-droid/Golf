# Update Golf Packages

You are helping the owner of Atlantic Links B&B update their golf package pricing and inclusions on the website.

## Steps

1. Ask the user which package they want to update:
   - Weekend Getaway
   - Classic Links
   - Ultimate Donegal
   - All packages

2. Ask what the new price should be (in USD per person). If unchanged, skip.

3. Ask if they want to add or remove any inclusions from the package list.

4. Open `index.html` and find the matching `<article class="card">` element:
   - Weekend Getaway → first `.card` in `.packages__grid`
   - Classic Links → `.card.card--featured`
   - Ultimate Donegal → last `.card` in `.packages__grid`

5. Make the edits:
   - Update the price in `.card__price` (keep the "from" prefix and "/person" suffix)
   - Add/remove `<li>` items in `.card__includes`

6. Confirm the changes to the user and ask if they'd like to push to the live site.

## Notes
- Prices are always displayed in USD for American visitors
- The "from" prefix and "/person" suffix must always remain
- Keep the inclusions list to 5–7 items for visual balance
- After editing, offer to run: git add index.html && git commit -m "Update package pricing" && git push
