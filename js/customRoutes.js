async function fetchPublicRoutes() {
  const { data, error } = await sb
    .from("custom_routes")
    .select("*")
    .eq("is_public", true)
    .order("created_at", { ascending: false });
  if (error) return [];
  return data;
}

async function fetchMyPrivateRoutes() {
  const { data, error } = await sb
    .from("custom_routes")
    .select("*")
    .eq("is_public", false)
    .order("created_at", { ascending: false });
  if (error) return [];
  return data;
}

async function createCustomRoute({ name, stops, isPublic, profile }) {
  const { data, error } = await sb
    .from("custom_routes")
    .insert({
      user_id: profile.id,
      creator_username: profile.username,
      name,
      stops,
      is_public: isPublic,
    })
    .select()
    .single();

  if (error) throw new Error("Kunne ikke lagre løypen. Prøv igjen.");
  return data;
}

async function deleteCustomRoute(id) {
  const { error } = await sb.from("custom_routes").delete().eq("id", id);
  if (error) throw new Error("Kunne ikke slette løypen.");
}

async function fetchCustomRouteById(id) {
  const { data, error } = await sb
    .from("custom_routes")
    .select("*")
    .eq("id", id)
    .single();
  if (error) return null;
  return data;
}

function customRouteToRouteShape(row) {
  return {
    id: `c${row.id}`,
    name: row.name,
    description: `Laget av ${row.creator_username}`,
    stops: row.stops,
    loop: false,
  };
}
