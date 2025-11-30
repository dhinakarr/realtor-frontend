import React from 'react';

export default function Home() {
  const projects = [
    { id: 1, name: 'Project A', image: '/assets/placeholder.png' },
    { id: 2, name: 'Project B', image: '/assets/placeholder.png' },
    { id: 3, name: 'Project C', image: '/assets/placeholder.png' }
  ];

  return (
    <div className="container my-4">
      <h3>Our Projects</h3>
      <div className="row">
        {projects.map(p => (
          <div key={p.id} className="col-md-4 mb-3">
            <div className="card shadow-sm">
              <img src={p.image} className="card-img-top" alt={p.name} />
              <div className="card-body">
                <h5 className="card-title">{p.name}</h5>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
