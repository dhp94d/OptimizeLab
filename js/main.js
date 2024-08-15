function showTopBar() {
  let country = 'France';
  let vat = 20;
  requestAnimationFrame(() => {
    document.querySelector(
      'section.country-bar'
    ).innerHTML = `<p>Orders to <b>${country}</b> are subject to <b>${vat}%</b> VAT</p>`;
  });
}

showTopBar();
