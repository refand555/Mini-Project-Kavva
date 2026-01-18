import supabase from "../../../lib/supabaseClient";

//
// GET PRODUCT (ambil produk lengkap)
//
export async function getProducts() {
  const { data, error } = await supabase
    .from("product")
    .select(`
      id,
      name,
      brand_id,
      description,
      created_by:profiles(id, usernames),
      brands(name),
      product_categories(
        category_id,
        categories(name)
      ),
      product_image(order, image_url),
      stock_variants(
        id,
        size,
        stock,
        price,
        grades:grades_id(name),
        created_by:profiles(id, usernames)
      )
    `)
    .order("id", { ascending: true });

  if (error) throw error;
  return data;
}

//
// GET PRODUCT (SINGLE)
//
export async function getProductById(id) {
  const { data, error } = await supabase
    .from("product")
    .select(`
      id,
      name,
      brand_id,
      description,
      created_by:profiles(id, usernames),
      product_categories (
        category_id,
        categories(name)
      ),
      product_image (
        order,
        image_url
      )
      .order("order", { ascending: true })
      stock_variants (
        id,
        size,
        stock,
        price,
        grades:grades_id(name),
        created_by:profiles(id, usernames)
      )
    `)
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

//
// INSERT PRODUCT
//
export async function insertProduct(form, img1, img2, brandId, categoryIds) {
  const {
    data: { user }
  } = await supabase.auth.getUser();

  // 1. Insert Produk utama
  const { data: product, error: err1 } = await supabase
    .from("product")
    .insert([
      {
        name: form.nama,
        brand_id: brandId,
        description: form.deskripsi,
        created_by: user.id
      }
    ])
    .select()
    .single();

  if (err1) throw err1;

  const productId = product.id;

  // 2. Insert kedua gambar
  await supabase.from("product_image").insert([
    { product_id: productId, image_url: img1, order: 1 },
    { product_id: productId, image_url: img2, order: 2 },
    { product_id: productId, image_url: img3, order: 3 },
    { product_id: productId, image_url: img4, order: 4 },
    { product_id: productId, image_url: img5, order: 5 }

  ]);

  // 3. Insert kategori
  if (categoryIds.length > 0) {
    const mapping = categoryIds.map((cat) => ({
      product_id: productId,
      category_id: cat
    }));
    await supabase.from("product_categories").insert(mapping);
  }

  // 4. Insert varian pertama
  await supabase.from("stock_variants").insert([
    {
      product_id: productId,
      size: form.size.trim().toUpperCase(),
      grades_id: Number(form.grades_id),
      price: Number(form.harga),
      stock: Number(form.stock),
      created_by: user.id
    }
  ]);

  return product;
}

//
// DELETE PRODUCT
//
export async function deleteProduct(id) {
  const { data: images } = await supabase
    .from("product_image")
    .select("image_url")
    .eq("product_id", id);

  if (images && images.length > 0) {
    for (const img of images) {
      const path = img.image_url.split("/product_image/")[1];
      if (path) {
        await supabase.storage.from("product_image").remove([path]);
      }
    }
  }

  await supabase.from("product_image").delete().eq("product_id", id);
  await supabase.from("product_categories").delete().eq("product_id", id);
  await supabase.from("stock_variants").delete().eq("product_id", id);

  const { error } = await supabase.from("product").delete().eq("id", id);
  if (error) throw error;
}

//
// UPDATE PRODUCT
//
export async function updateProduct(productId, form, newImg1, newImg2, brandId, categoryIds) {
  const { data: oldImages } = await supabase
    .from("product_image")
    .select("id, image_url, order")
    .eq("product_id", productId);

  const imagesToDelete = [];

  if (newImg1 && oldImages[0]) {
    const path = oldImages[0].image_url.split("/product_image/")[1];
    if (path) imagesToDelete.push(path);
  }

  if (newImg2 && oldImages[1]) {
    const path = oldImages[1].image_url.split("/product_image/")[1];
    if (path) imagesToDelete.push(path);
  }

  if (imagesToDelete.length > 0) {
    await supabase.storage.from("product_image").remove(imagesToDelete);
  }

  if (newImg1) {
    await supabase
      .from("product_image")
      .update({ image_url: newImg1 })
      .eq("product_id", productId)
      .eq("order", 1);
  }

  if (newImg2) {
    await supabase
      .from("product_image")
      .update({ image_url: newImg2 })
      .eq("product_id", productId)
      .eq("order", 2);
  }

  await supabase
    .from("product")
    .update({
      name: form.nama,
      brand_id: brandId,
      description: form.deskripsi
    })
    .eq("id", productId);

  await supabase.from("product_categories").delete().eq("product_id", productId);

  if (categoryIds.length > 0) {
    const mapping = categoryIds.map((cat) => ({
      product_id: productId,
      category_id: cat
    }));
    await supabase.from("product_categories").insert(mapping);
  }

  return true;
}

// =======================================================
// VARIANT API (stock_variants)
// =======================================================

export async function getVariants(productId) {
  const { data, error } = await supabase
    .from("stock_variants")
    .select(`
      id,
      size,
      price,
      stock,
      grades:grades_id ( id, name ),
      created_by:profiles(id, usernames)
    `)
    .eq("product_id", productId)
    .order("id", { ascending: true });

  if (error) throw error;
  return data;
}

export async function getAllGrades() {
  const { data, error } = await supabase
    .from("grades")
    .select("id, name")
    .order("name");

  if (error) throw error;
  return data;
}

export async function addVariant(productId, variant) {
  const {
    data: { user }
  } = await supabase.auth.getUser();

  const payload = {
    product_id: productId,
    size: variant.size.trim().toUpperCase(),
    grades_id: Number(variant.grades_id),
    price: Number(variant.price),
    stock: Number(variant.stock),
    created_by: user.id
  };

  const { error } = await supabase
    .from("stock_variants")
    .insert([payload]);

  if (error) throw error;
  return true;
}

export async function updateVariantField(variantId, field, value) {
  const { error } = await supabase
    .from("stock_variants")
    .update({ [field]: value })
    .eq("id", variantId);

  if (error) throw error;
  return true;
}

export async function deleteVariant(variantId) {
  const { error } = await supabase
    .from("stock_variants")
    .delete()
    .eq("id", variantId);

  if (error) throw error;
  return true;
}