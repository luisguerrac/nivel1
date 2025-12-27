import React from 'react';
import type { TableData } from '../types';

interface TableComponentProps {
  data: TableData;
}

const TableComponent: React.FC<TableComponentProps> = ({ data }) => {
  if (!data || !data.headers || !data.rows) {
    return <p className="my-4" style={{ color: '#ef4444' }}>Datos de la tabla inválidos.</p>;
  }
  
  return (
    <div className="table-wrapper">
      <table className="data-table">
        <thead>
          <tr>
            {data.headers.map((header, index) => (
              <th key={index}>
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.rows.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((cell, cellIndex) => (
                <td key={cellIndex}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TableComponent;