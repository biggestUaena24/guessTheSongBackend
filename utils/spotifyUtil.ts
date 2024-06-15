export async function getPlaylists(userId: string, token: string) {
  const result = await fetch(
    `https://api.spotify.com/v1/users/${userId}/playlists?limit=50`,
    {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  return await result.json();
}
