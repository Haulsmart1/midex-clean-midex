import Head from 'next/head';
import SuperAdminLayout from '@/components/layouts/SuperAdminLayout';

export default function FinancesPage() {
  const reports = [
    { id: 1, title: "August Revenue", amount: "£14,300", date: "2025-08-01", type: "Income" },
    { id: 2, title: "Platform Expenses", amount: "-£3,200", date: "2025-08-03", type: "Expense" },
    { id: 3, title: "Refunds Issued", amount: "-£500", date: "2025-08-07", type: "Expense" },
  ];

  return (
    <SuperAdminLayout>
      <Head>
        <title>Finances | Super Admin</title>
      </Head>

      <div className="container py-4 text-white">
        <h1 className="mb-4 fw-bold">💰 Financial Overview</h1>

        <div className="card shadow border-0 bg-dark">
          <div className="card-body">
            <table className="table table-dark table-striped table-hover">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Amount</th>
                  <th>Date</th>
                  <th>Type</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((r) => (
                  <tr key={r.id}>
                    <td>{r.title}</td>
                    <td className={r.amount.startsWith('-') ? 'text-danger' : 'text-success'}>
                      {r.amount}
                    </td>
                    <td>{r.date}</td>
                    <td>
                      <span className={`badge ${r.type === 'Income' ? 'bg-success' : 'bg-danger'}`}>
                        {r.type}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </SuperAdminLayout>
  );
}
