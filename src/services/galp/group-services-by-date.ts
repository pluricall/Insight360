export function groupByDateAndService(data: any[]) {
  const dates = [...new Set(data.map(d => d.date))];
  const services = [...new Set(data.map(d => d.service))];

  const rows = dates.map(date => {
    const row: any = { date };

    services.forEach(service => {
      const match = data.find(
        d => d.date === date && d.service === service
      );
      row[service] = match ? Number(match.total) : 0;
    });

    return row;
  });

  return { services, rows };
}
