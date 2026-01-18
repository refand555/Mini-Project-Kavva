// src/services/ProductService.jsx
import supabase from "../lib/supabaseClient";
import { BRAND_MAP } from "../utils/BrandMap";
import { mapProducts } from "../data/ProductMapper";

// helper: resolve grade names (BNIB/VNDS/USED) -> grades.id dari tabel grades
async function resolveGradeIds(gradeNames = []) {
  const names = gradeNames
    .map((g) => String(g).trim().toUpperCase())
    .filter(Boolean);

  if (names.length === 0) return [];

  const { data, error } = await supabase
    .from("grades")
    .select("id,name")
    .in("name", names);

  if (error) throw error;

  return (data || []).map((r) => r.id);
}

function applyPriceFilter(query, priceKey) {
  if (!priceKey) return query;

  if (priceKey === "lt-1000000") {
    return query.lt("stock_variants.price", 1_000_000);
  }
  if (priceKey === "1000000-3000000") {
    return query
      .gte("stock_variants.price", 1_000_000)
      .lte("stock_variants.price", 3_000_000);
  }
  if (priceKey === "gt-3000000") {
    return query.gt("stock_variants.price", 3_000_000);
  }
  return query;
}

// ======================
// GET PRODUCT BY BRAND
// - TETAP SAMA kalau filters kosong
// - Kalau filters aktif: BE filter + inner join biar produk non-match hilang
// ======================
export async function getProductsByBrandSlug(slug, filters = {}) {
  const brandId = BRAND_MAP[slug];
  if (!brandId) return [];

  const hasGrades = Array.isArray(filters.grades) && filters.grades.length > 0;
  const hasPrice = !!filters.price;
  const hasFilter = hasGrades || hasPrice;

  // 1) MODE LAMA (NO FILTER) -> persis seperti file awal kamu
  if (!hasFilter) {
    const { data, error } = await supabase
      .from("product")
      .select(`
        id,
        name,
        brand_id,
        brands ( name ),
        product_image ( order, image_url ),
        stock_variants ( price ),
        product_categories (
          categories ( slug )
        )
      `)
      .eq("brand_id", brandId);

    if (error) throw error;
    return mapProducts(data);
  }

  // 2) MODE FILTER (BE) -> lock brand dulu, baru filter variant
  let query = supabase
    .from("product")
    .select(`
      id,
      name,
      brand_id,
      brands ( name ),
      product_image ( order, image_url ),
      stock_variants!inner ( price, stock, grades_id ),
      product_categories (
        categories ( slug )
      )
    `)
    .eq("brand_id", brandId);

  // grades filter
  if (hasGrades) {
    const gradeIds = await resolveGradeIds(filters.grades);
    if (gradeIds.length === 0) return []; // kalau nama grades tidak valid, hasil harus kosong
    query = query.in("stock_variants.grades_id", gradeIds);
  }

  // price filter
  query = applyPriceFilter(query, filters.price);

  // stock only (biar match-nya beneran ada stok)
  query = query.gt("stock_variants.stock", 0);

  const { data, error } = await query;
  if (error) throw error;

  return mapProducts(data || []);
}

// =======================
// GET PRODUCT BY CATEGORY
// - MODE LAMA tetap: ambil semua lalu filter slug di FE (seperti awal)
// - MODE FILTER: BE filter + inner join category + inner join variants
// =======================
export async function getProductsByCategorySlug(slug, filters = {}) {
  const hasGrades = Array.isArray(filters.grades) && filters.grades.length > 0;
  const hasPrice = !!filters.price;
  const hasFilter = hasGrades || hasPrice;

  // 1) MODE LAMA (NO FILTER) -> persis seperti file awal kamu
  if (!hasFilter) {
    const { data, error } = await supabase
      .from("product")
      .select(`
        id,
        name,
        brand_id,
        brands ( name ),
        product_image ( order, image_url ),
        stock_variants ( price ),
        product_categories (
          categories ( slug )
        )
      `);

    if (error) throw error;

    const filtered = (data || []).filter((p) =>
      p.product_categories?.some((pc) => pc.categories?.slug === slug)
    );

    return mapProducts(filtered);
  }

  // 2) MODE FILTER (BE) -> lock category slug dulu, baru filter variant
  let query = supabase
    .from("product")
    .select(`
      id,
      name,
      brand_id,
      brands ( name ),
      product_image ( order, image_url ),
      stock_variants!inner ( price, stock, grades_id ),
      product_categories!inner (
        categories!inner ( slug )
      )
    `)
    .eq("product_categories.categories.slug", slug);

  // grades filter
  if (hasGrades) {
    const gradeIds = await resolveGradeIds(filters.grades);
    if (gradeIds.length === 0) return [];
    query = query.in("stock_variants.grades_id", gradeIds);
  }

  // price filter
  query = applyPriceFilter(query, filters.price);

  // stock only
  query = query.gt("stock_variants.stock", 0);

  const { data, error } = await query;
  if (error) throw error;

  return mapProducts(data || []);
}

// =======================
// SEARCH
// (belum difilter, biar tidak ganggu sistem lama)
// =======================
export async function searchProducts(query) {
  const { data, error } = await supabase
    .from("product")
    .select(`
      id,
      name,
      brand_id,
      brands ( name ),
      product_image ( order, image_url ),
      stock_variants ( price ),
      product_categories (
        categories ( slug )
      )
    `)
    .ilike("name", `%${query}%`)
    .order("id", { ascending: true });

  if (error) throw error;
  return mapProducts(data);
}

// =======================
// SEARCH + FILTER (BARU)
// - lock by keyword (q)
// - filter via BE
// - mapping konsisten
// =======================
export async function searchProductsFiltered(queryText, filters = {}) {
  const hasGrades = Array.isArray(filters.grades) && filters.grades.length > 0;
  const hasPrice = !!filters.price;

  let query = supabase
    .from("product")
    .select(`
      id,
      name,
      brand_id,
      brands ( name ),
      product_image ( order, image_url ),
      stock_variants!inner ( price, stock, grades_id ),
      product_categories (
        categories ( slug )
      )
    `)
    .ilike("name", `%${queryText}%`);

  // grades filter
  if (hasGrades) {
    const gradeIds = await resolveGradeIds(filters.grades);
    if (gradeIds.length === 0) return [];
    query = query.in("stock_variants.grades_id", gradeIds);
  }

  // price filter
  query = applyPriceFilter(query, filters.price);

  // stock only
  query = query.gt("stock_variants.stock", 0);

  const { data, error } = await query;
  if (error) throw error;

  return mapProducts(data || []);
}