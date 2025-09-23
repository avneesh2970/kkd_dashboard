export const verifyAdminToken = async () => {
  const token = sessionStorage.getItem("userToken");
  if (!token) return false;

  try {
    const res = await fetch(
      `${import.meta.env.VITE_BACKEND_API}/api/admin/verify-token`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
      }
    );

    if (res.status === 401) {
      // remove invalid token immediately
      sessionStorage.removeItem("userToken");
      return false;
    }

    if (!res.ok) return false;

    const data = await res.json();
    return data.valid;
  } catch (error) {
    console.error(error);
    sessionStorage.removeItem("userToken");
    return false;
  }
};
