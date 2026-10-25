/**
 * KATALOG (pelanggan): Koin / Voucher / Farm dengan status Ready / Tidak Ready (tanpa stok).
 * Butuh sql/katalog-pesan-baru.sql. Gambar dimuat per item dan di-cache.
 */
Object.assign(TRANSLATIONS.id, {
    cat_tab_stock: "Stok", cat_tab_catalog: "Katalog", cat_title: "Katalog", cat_koin: "Koin", cat_voucher: "Voucher", cat_farm: "Farm",
    cat_ready: "Ready", cat_not_ready: "Tidak Ready", cat_empty: "Belum ada item di kategori ini.", cat_order: "Pesan via WhatsApp",
    cat_wa_text: "Halo admin, saya {u} ingin memesan: {item} ({kat})."
});
Object.assign(TRANSLATIONS.en, {
    cat_tab_stock: "Stock", cat_tab_catalog: "Catalog", cat_title: "Catalog", cat_koin: "Coins", cat_voucher: "Vouchers", cat_farm: "Farm",
    cat_ready: "Ready", cat_not_ready: "Not Ready", cat_empty: "No items in this category yet.", cat_order: "Order via WhatsApp",
    cat_wa_text: "Hello admin, I'm {u} and I'd like to order: {item} ({kat})."
});

Object.assign(TRANSLATIONS.id, {
    cat_coin_order: "Pesan dengan Koin", cat_qty: "Jumlah", cat_note_label: "Catatan untuk admin (mis. ID Hay Day / akun tujuan)", cat_ordered: "Pesanan terkirim — menunggu admin memproses",
    cat_my_orders: "Pesanan Katalog Saya", cat_st_pending: "⏳ Menunggu admin", cat_st_done: "✅ Selesai", cat_st_rejected: "✖ Ditolak (koin dikembalikan)", cat_confirm: "Konfirmasi Pesanan", cat_send: "Pesan & Bayar Koin",
    farm_buy: "Beli", farm_stock: "Stok", farm_unit: "/ token", farm_bought: "Pembelian Berhasil", farm_sent: "{n} token farm sudah dikirim ke akun Anda:", farm_copy_all: "Salin semua", farm_copied: "Tersalin",
    farm_my: "Pembelian Farm Saya", farm_empty_stock: "Stok habis", farm_err_stock: "Stok farm tidak cukup", farm_err_na: "Farm tidak tersedia", cat_err_ready: "Item sedang tidak ready", cat_err_price: "Harga koin item belum diatur admin"
});
Object.assign(TRANSLATIONS.en, {
    cat_coin_order: "Order with Coins", cat_qty: "Qty", cat_note_label: "Note for admin (e.g. Hay Day ID / target account)", cat_ordered: "Order sent — waiting for the admin to process it",
    cat_my_orders: "My Catalog Orders", cat_st_pending: "⏳ Awaiting admin", cat_st_done: "✅ Done", cat_st_rejected: "✖ Rejected (coins refunded)", cat_confirm: "Confirm Order", cat_send: "Order & Pay Coins",
    farm_buy: "Buy", farm_stock: "Stock", farm_unit: "/ token", farm_bought: "Purchase Successful", farm_sent: "{n} farm tokens have been delivered to your account:", farm_copy_all: "Copy all", farm_copied: "Copied",
    farm_my: "My Farm Purchases", farm_empty_stock: "Out of stock", farm_err_stock: "Not enough farm stock", farm_err_na: "Farm not available", cat_err_ready: "This item is not ready", cat_err_price: "This item's coin price has not been set"
});
Object.assign(TRANSLATIONS.id, {
    farm_cf_item: "Akun / Farm", farm_cf_qty: "Jumlah × harga", farm_pay_btn: "Bayar {n} Koin & Beli",
    farm_pay_note: "🌱 Setelah koin dipotong, token langsung dikirim otomatis dan tersimpan di Riwayat Pembelian Farm Saya (Supply & Stock → Katalog). Pembelian tidak bisa dibatalkan.",
    farm_saved_hist: "Token juga tersimpan di Riwayat Pembelian Farm Saya.", farm_view_hist: "Lihat Riwayat Pembelian", farm_desc_title: "Deskripsi akun"
});
Object.assign(TRANSLATIONS.en, {
    farm_cf_item: "Account / Farm", farm_cf_qty: "Qty × price", farm_pay_btn: "Pay {n} Coins & Buy",
    farm_pay_note: "🌱 Once the coins are deducted, the tokens are delivered automatically and saved in My Farm Purchases (Supply & Stock → Catalog). Purchases cannot be cancelled.",
    farm_saved_hist: "The tokens are also saved in My Farm Purchases.", farm_view_hist: "View Purchase History", farm_desc_title: "Account description"
});
Object.assign(SERVER_ERROR_MAP, { "Stok farm tidak cukup": "farm_err_stock", "Farm tidak tersedia": "farm_err_na", "Item sedang tidak ready": "cat_err_ready", "Harga koin item belum diatur admin": "cat_err_price" });

let myCatalog = [], myCatCats = [], catKat = "koin", myFarmShop = [], myCatOrders = [], myFarmSales = [];
const CAT_DEFAULT = [{ slug: "koin", nama: "Koin", ikon: "🪙" }, { slug: "voucher", nama: "Voucher", ikon: "🎟" }, { slug: "farm", nama: "Farm", ikon: "🌱" }];
const _catImg = {};   // "id:versi" -> dataURL
const catKey = c => c.id + ":" + c.img_v;
const farmKey = f => "farm" + f.id + ":" + f.img_v;

async function loadCatalog() {
    const [a, b, fs, co, fsl] = await Promise.all([cuRpc("cu_catalog"), cuRpc("cu_catalog_cats"), cuRpc("cu_farm_shop"), cuRpc("cu_my_catalog_orders"), cuRpc("cu_my_farm_sales")]);
    myCatalog = a.data || [];
    myFarmShop = (!fs.error && fs.data) || []; myCatOrders = (!co.error && co.data) || []; myFarmSales = (!fsl.error && fsl.data) || [];
    myCatCats = (!b.error && b.data && b.data.length) ? b.data : CAT_DEFAULT;   // SQL kategori belum dijalankan -> 3 kategori bawaan
    if (!myCatCats.some(c => c.slug === catKat)) catKat = myCatCats[0].slug;
    renderCatalog();
}

function renderCatalog() {
    const box = $("catList"); if (!box) return;
    $("catTabs").innerHTML = myCatCats.map(c => `<button type="button" class="${c.slug === catKat ? "on" : ""}" data-kat="${escapeHtml(c.slug)}">${escapeHtml(c.ikon)} ${escapeHtml(c.nama)} <i>${(myCatalog.filter(x => x.kategori === c.slug).length + (c.slug === "farm" ? myFarmShop.length : 0))}</i></button>`).join("");
    const list = myCatalog.filter(c => c.kategori === catKat);
    $("catEmpty").style.display = (list.length || (catKat === "farm" && myFarmShop.length)) ? "none" : "block";
    const user = sessionStorage.getItem("admin_view_name") || localStorage.getItem("pelanggan_username") || "";
    const farmHtml = catKat !== "farm" ? "" : myFarmShop.map(f => `<article class="shop-card">
            <div class="shop-media" data-fid="${f.id}" ${f.img_v ? `onclick="openFarmImg(${f.id})"` : ""}>${(f.img_v && _catImg[farmKey(f)]) ? `<img src="${_catImg[farmKey(f)]}" alt="${escapeHtml(f.nama)}">` : `<div class="shop-ph">${f.img_v ? "⏳" : "🌱"}</div>`}<span class="cat-state ${f.available ? "ok" : "off"}">${f.available ? "● " + escapeHtml(t("cat_ready")) : "○ " + escapeHtml(t("farm_empty_stock"))}</span></div>
            <div class="shop-body"><div class="supply-name">${escapeHtml(f.nama)}</div>
                ${f.deskripsi ? `<div class="supply-meta farm-desc">${linkify(f.deskripsi)}</div>` : ""}
                <div class="cat-price">🪙 ${fmtNum(f.harga_koin)} ${escapeHtml(t("farm_unit"))}${cuCoinUsd(f.harga_koin) ? ` <small>${escapeHtml(cuCoinUsd(f.harga_koin))}</small>` : ""}</div>
                <div class="supply-meta">${escapeHtml(t("farm_stock"))}: <b>${fmtNum(f.available)}</b> token</div>
                <div class="supply-order"><input type="number" id="fq${f.id}" min="1" max="${f.available}" inputmode="numeric" placeholder="${escapeHtml(t("cat_qty"))}" ${f.available ? "" : "disabled"} oninput="onFarmQty(${f.id})">
                    <button type="button" class="btn btn-primary" onclick="buyFarm(${f.id})" ${f.available ? "" : "disabled"}>${escapeHtml(t("farm_buy"))}</button></div>
                <div class="supply-sum" id="fqt${f.id}"></div></div></article>`).join("");
    box.innerHTML = farmHtml + list.map(c => {
        const src = c.img_v && _catImg[catKey(c)];
        const kn = (myCatCats.find(x => x.slug === c.kategori) || { nama: c.kategori }).nama;
        const msg = t("cat_wa_text", { u: user, item: c.nama, kat: kn }) + (c.harga ? " " + c.harga : "");
        return `<article class="shop-card ${c.ready ? "" : "is-off"}">
            <div class="shop-media" data-cid="${c.id}" ${c.img_v ? `onclick="openCatImg(${c.id})"` : ""}>
                ${src ? `<img src="${src}" alt="${escapeHtml(c.nama)}">` : `<div class="shop-ph">${c.img_v ? "⏳" : "🛍"}</div>`}
                <span class="cat-state ${c.ready ? "ok" : "off"}">${c.ready ? "● " + escapeHtml(t("cat_ready")) : "○ " + escapeHtml(t("cat_not_ready"))}</span>
            </div>
            <div class="shop-body">
                <div class="supply-name">${escapeHtml(c.nama)}</div>
                ${c.harga ? `<div class="cat-price">${escapeHtml(c.harga)}</div>` : ""}
                ${c.deskripsi ? `<div class="supply-meta">${linkify(c.deskripsi)}</div>` : ""}
                ${c.ready && c.harga_koin > 0 && c.kategori !== "farm"
                    ? `<div class="cat-price">🪙 ${fmtNum(c.harga_koin)}${cuCoinUsd(c.harga_koin) ? ` <small>${escapeHtml(cuCoinUsd(c.harga_koin))}</small>` : ""}</div>
                       <div class="supply-order"><input type="number" id="cq${c.id}" min="1" max="1000" value="1" inputmode="numeric" placeholder="${escapeHtml(t("cat_qty"))}">
                       <button type="button" class="btn btn-primary" onclick="orderCatalog(${c.id})">${escapeHtml(t("cat_coin_order"))}</button></div>`
                    : (c.ready ? contactButtonsHtml(msg, "cat-order") : "")}
            </div>
        </article>`;
    }).join("");
    hydrateCatImages();
    renderMyCatOrders();
}

/* ---- pesan item katalog (koin Hayday / voucher) dengan koin: menunggu admin ---- */
function orderCatalog(id) {
    const c = myCatalog.find(x => x.id === id); if (!c) return;
    const q = Math.max(1, parseInt($("cq" + id).value, 10) || 1), total = c.harga_koin * q;
    $("modalBox").innerHTML = `<div class="modal-title">🛍 ${escapeHtml(t("cat_confirm"))}</div>
        <div class="modal-sub">${escapeHtml(c.nama)} × ${fmtNum(q)}</div>
        <div class="coin-lines"><div class="coin-line"><span>${escapeHtml(t("coin_total"))}</span><b>🪙 ${fmtNum(total)}${cuCoinUsd(total) ? `<small class="coin-usd">${escapeHtml(cuCoinUsd(total))}</small>` : ""}</b></div></div>
        <label class="rn-label" for="coNote">${escapeHtml(t("cat_note_label"))}</label><textarea id="coNote" class="no-area" rows="3" maxlength="300"></textarea>
        <div class="modal-actions"><button type="button" class="btn btn-ghost" id="coNo">${escapeHtml(t("rn_cancel"))}</button><button type="button" class="btn btn-primary" id="coYes">${escapeHtml(t("cat_send"))}</button></div>`;
    $("modalOverlay").classList.add("show"); $("coNo").addEventListener("click", closeModal);
    $("coYes").addEventListener("click", async () => {
        $("coYes").disabled = true;
        const paid = await payStep({ pkg: "CATALOG", total, waText: tot => t("cat_wa_text", { u: contactUser(), item: c.nama + " x" + q, kat: tot }) });
        if (!paid) { $("coYes").disabled = false; return; }
        const { error } = await cuRpc("cu_order_catalog", { p_item_id: id, p_qty: q, p_catatan: $("coNote").value.trim() || null });
        closeModal();
        if (error) { showToast(translateServerError(error.message) || error.message || "Error", "danger"); return; }
        showToast(t("cat_ordered"), "success"); loadCatalog(); if (typeof loadCoin === "function") loadCoin();
    });
}
function onFarmQty(id) {
    const f = myFarmShop.find(x => x.id === id), el = $("fqt" + id); if (!f || !el) return;
    const q = parseInt($("fq" + id).value, 10), tot = q > 0 ? f.harga_koin * q : 0;
    el.textContent = tot ? `${t("supply_total")}: 🪙 ${fmtNum(tot)}${cuCoinUsd(tot) ? " · " + cuCoinUsd(tot) : ""}` : "";
}
/** Beli token farm: saldo cukup -> token langsung dikirim otomatis. */
async function buyFarm(id) {
    const f = myFarmShop.find(x => x.id === id); if (!f) return;
    const q = parseInt($("fq" + id).value, 10);
    if (!q || q < 1) { showToast(t("supply_qty_err"), "danger"); return; }
    if (q > f.available) { showToast(t("farm_err_stock"), "danger"); return; }
    const total = f.harga_koin * q;
    const paid = await payStep({ pkg: "FARM", total, payBtnKey: "farm_pay_btn", note: t("farm_pay_note"),
        lines: [[t("farm_cf_item"), f.nama], [t("farm_cf_qty"), `${fmtNum(q)} × 🪙 ${fmtNum(f.harga_koin)}`]], waText: tot => t("cat_wa_text", { u: contactUser(), item: f.nama + " x" + q, kat: tot }) });
    if (!paid) return;
    const { data, error } = await cuRpc("cu_buy_farm", { p_batch_id: id, p_qty: q });
    if (error) { showToast(translateServerError(error.message) || error.message || "Error", "danger"); return; }
    if (typeof loadCoin === "function") loadCoin();
    await loadCatalog();
    showFarmTokens(data.tokens, f.nama);
}
const farmLine = tk => `${tk.no},${tk.farm_id},${tk.token}`;
function showFarmTokens(tokens, nama) {
    const text = tokens.map(farmLine).join("\n");
    $("modalBox").innerHTML = `<div class="modal-icon success">🌱</div><div class="modal-title">${escapeHtml(t("farm_bought"))}</div>
        <div class="modal-sub">${escapeHtml(t("farm_sent", { n: tokens.length }))}<br><small>${escapeHtml(t("farm_saved_hist"))}</small></div>
        <textarea class="ct-msg" id="farmTok" rows="${Math.min(10, tokens.length + 1)}" readonly>${escapeHtml(text)}</textarea>
        <button type="button" class="btn btn-primary btn-block" id="farmCopy" style="margin-top:8px;">📋 ${escapeHtml(t("farm_copy_all"))}</button>
        <button type="button" class="btn btn-outline btn-block" id="farmHist" style="margin-top:8px;">🧾 ${escapeHtml(t("farm_view_hist"))}</button>
        <button type="button" class="btn btn-ghost btn-block" id="farmClose" style="margin-top:8px;">${escapeHtml(t("modal_close"))}</button>`;
    $("modalOverlay").classList.add("show");
    $("farmClose").addEventListener("click", closeModal);
    $("farmHist").addEventListener("click", () => {
        closeModal();
        const box = document.querySelector("#catMyOrders .farm-sale"); if (box) { box.open = true; box.scrollIntoView({ behavior: "smooth", block: "center" }); }
    });
    $("farmCopy").addEventListener("click", () => _payCopy(text, $("farmCopy")));
}
function renderMyCatOrders() {
    const box = $("catMyOrders"); if (!box) return;
    if (!myCatOrders.length && !myFarmSales.length) { box.innerHTML = ""; return; }
    const stl = { pending: "cat_st_pending", done: "cat_st_done", rejected: "cat_st_rejected" };
    const loc = numLocale();
    box.innerHTML = `<div class="panel bo-panel"><div class="panel-title">🛍 ${escapeHtml(t("cat_my_orders"))}</div>
        ${myCatOrders.map(o => `<div class="bo-item"><div><b>${escapeHtml(o.item_nama)}</b> × ${fmtNum(o.qty)}<div class="bo-item-sub">${new Date(o.created_at).toLocaleDateString(loc, { day: "2-digit", month: "short" })}${o.catatan_admin ? " · 💬 " + escapeHtml(o.catatan_admin) : ""}</div></div>
            <div style="text-align:right;"><b>🪙 ${fmtNum(o.total)}</b><div class="bo-item-sub">${escapeHtml(t(stl[o.status] || "cat_st_pending"))}</div></div></div>`).join("")}
        ${myFarmSales.length ? `<div class="rn-label" style="margin:10px 0 2px;">🌱 ${escapeHtml(t("farm_my"))}</div>` + myFarmSales.map(s => `<details class="bo-item farm-sale"><summary><b>${escapeHtml(s.batch_nama)}</b> × ${fmtNum(s.qty)} <span class="bo-item-sub">· 🪙 ${fmtNum(s.total)} · ${new Date(s.created_at).toLocaleDateString(loc, { day: "2-digit", month: "short" })}</span></summary>
            <textarea class="ct-msg" rows="${Math.min(6, s.tokens.length + 1)}" readonly>${escapeHtml(s.tokens.map(farmLine).join("\n"))}</textarea>
            <button type="button" class="btn btn-ghost mini" data-farm-copy="${s.id}" style="margin-top:6px;">📋 ${escapeHtml(t("farm_copy_all"))}</button></details>`).join("") : ""}</div>`;
}

function hydrateFarmImages() {
    myFarmShop.filter(f => f.img_v && !_catImg[farmKey(f)]).forEach(async f => {
        const { data } = await cuRpc("cu_farm_image", { p_batch_id: f.id });
        if (!data) return;
        _catImg[farmKey(f)] = `data:${data.mime};base64,${data.data}`;
        const ph = document.querySelector(`#catList .shop-media[data-fid="${f.id}"] .shop-ph`);
        if (ph) ph.outerHTML = `<img src="${_catImg[farmKey(f)]}" alt="${escapeHtml(f.nama)}">`;
    });
}
function openFarmImg(id) {
    const f = myFarmShop.find(x => x.id === id), src = f && _catImg[farmKey(f)]; if (!src) return;
    $("modalBox").innerHTML = `<img src="${src}" alt="" class="shop-zoom"><div class="modal-title" style="margin-top:12px;">${escapeHtml(f.nama)}</div>
        <div class="modal-sub">🪙 ${fmtNum(f.harga_koin)} ${escapeHtml(t("farm_unit"))}</div>
        ${f.deskripsi ? `<div class="farm-desc farm-desc-zoom">${linkify(f.deskripsi)}</div>` : ""}
        <button type="button" class="btn btn-ghost btn-block" id="zoomClose">${escapeHtml(t("modal_close"))}</button>`;
    $("modalOverlay").classList.add("show"); $("zoomClose").addEventListener("click", closeModal);
}

function hydrateCatImages() {
    hydrateFarmImages();
    myCatalog.filter(c => c.img_v && !_catImg[catKey(c)]).forEach(async c => {
        const { data } = await cuRpc("cu_catalog_image", { p_id: c.id });
        if (!data) return;
        _catImg[catKey(c)] = `data:${data.mime};base64,${data.data}`;
        const el = document.querySelector(`#catList .shop-media[data-cid="${c.id}"]`);
        const ph = el && el.querySelector(".shop-ph");
        if (ph) ph.outerHTML = `<img src="${_catImg[catKey(c)]}" alt="${escapeHtml(c.nama)}">`;
    });
}

function openCatImg(id) {
    const c = myCatalog.find(x => x.id === id), src = c && _catImg[catKey(c)]; if (!src) return;
    $("modalBox").innerHTML = `<img src="${src}" alt="" class="shop-zoom"><div class="modal-title" style="margin-top:12px;">${escapeHtml(c.nama)}</div>
        ${c.harga ? `<div class="modal-sub">${escapeHtml(c.harga)}</div>` : ""}
        <button type="button" class="btn btn-ghost btn-block" id="zoomClose">${escapeHtml(t("modal_close"))}</button>`;
    $("modalOverlay").classList.add("show"); $("zoomClose").addEventListener("click", closeModal);
}

document.addEventListener("click", (e) => {
    const b = e.target.closest("[data-farm-copy]"); if (!b) return;
    const sale = myFarmSales.find(x => String(x.id) === b.dataset.farmCopy);
    if (sale) _payCopy(sale.tokens.map(farmLine).join("\n"), b);
});

document.addEventListener("DOMContentLoaded", () => {
    $("supplySubTabs").addEventListener("click", (e) => {
        const b = e.target.closest("button[data-sub]"); if (!b) return;
        document.querySelectorAll("#supplySubTabs button").forEach(x => x.classList.toggle("on", x === b));
        $("supStokWrap").style.display = b.dataset.sub === "stok" ? "block" : "none";
        $("supKatalogWrap").style.display = b.dataset.sub === "katalog" ? "block" : "none";
    });
    $("catTabs").addEventListener("click", (e) => { const b = e.target.closest("button[data-kat]"); if (b) { catKat = b.dataset.kat; renderCatalog(); } });
    document.addEventListener("langchange", renderCatalog);
    loadCatalog();
});
