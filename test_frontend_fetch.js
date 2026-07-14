const url = 'https://backend-50043946419.development.catalystappsail.in/api/v1/dashboard';

fetch(url, { headers: { 'Content-Type': 'application/json' } })
  .then(res => {
    console.log("Status:", res.status);
    return res.json();
  })
  .then(data => {
    console.log("Raw JSON:", JSON.stringify(data, null, 2));
    
    // Mimic analytics.ts parsing
    const dashboardKPIs = data.kpis || data;
    console.log("Parsed dashboardKPIs:");
    console.log(dashboardKPIs);
  })
  .catch(err => console.error(err));
