export const fetcher = async (url) => {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'same-origin',
    });
    if (!response.ok) {
      console.error(`Failed fetcher ${url}:`, response.statusText);
      return null;
    }
    return response.json();
  };
  