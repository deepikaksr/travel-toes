import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const Home = () => {
  const [country, setCountry] = useState('');
  const [state, setState] = useState('');
  const [cities, setCities] = useState([{ city: '', places: '', totalBudget: '', days: '' }]);
  const [expensePlan, setExpensePlan] = useState(null);

  const budgetPercentages = {
    transport: 0.1,
    food: 0.3,
    activities: 0.6,
  };

  const handleAddCity = () => {
    setCities([...cities, { city: '', places: '', totalBudget: '', days: '' }]);
  };

  const handleCityChange = (index, event) => {
    const newCities = [...cities];
    newCities[index][event.target.name] = event.target.value;
    setCities(newCities);
  };

  const handleDeleteCity = (index) => {
    const newCities = cities.filter((_, i) => i !== index);
    setCities(newCities);
  };

  const handleGeneratePlanner = () => {
    const plan = cities.map((cityObj) => {
      const totalBudget = parseFloat(cityObj.totalBudget || 0);
      const numberOfDays = parseInt(cityObj.days || 1, 10);
      const perDayBudget = (totalBudget / numberOfDays).toFixed(2);

      const transportBudget = (perDayBudget * budgetPercentages.transport).toFixed(2);
      const foodBudget = (perDayBudget * budgetPercentages.food).toFixed(2);
      const activitiesBudget = (perDayBudget * budgetPercentages.activities).toFixed(2);

      const placesArray = cityObj.places.split(',').map((place) => place.trim());
      const perPlaceBudget = (totalBudget / placesArray.length).toFixed(2);

      const placesBudgetDetails = placesArray.map((place) => ({
        name: place,
        totalPlaceBudget: perPlaceBudget,
        transportBudget: (perPlaceBudget * budgetPercentages.transport).toFixed(2),
        foodBudget: (perPlaceBudget * budgetPercentages.food).toFixed(2),
        activitiesBudget: (perPlaceBudget * budgetPercentages.activities).toFixed(2),
      }));

      return {
        city: cityObj.city,
        totalBudget: totalBudget.toFixed(2),
        days: numberOfDays,
        transportBudget,
        foodBudget,
        activitiesBudget,
        places: placesBudgetDetails,
      };
    });

    setExpensePlan(plan);
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(14);
    doc.text('Expense Planner', 14, 20);

    let yPosition = 30;

    if (expensePlan) {
      expensePlan.forEach((cityObj) => {
        doc.setFontSize(12);
        doc.text(`${cityObj.city} - Total Budget: ₹${cityObj.totalBudget} for ${cityObj.days} Days`, 14, yPosition);
        yPosition += 10;

        const tableData = cityObj.places.map((place) => [
          place.name,
          `₹${place.totalPlaceBudget}`,
          `₹${place.transportBudget}`,
          `₹${place.foodBudget}`,
          `₹${place.activitiesBudget}`,
        ]);

        doc.autoTable({
          head: [['Place Name', 'Total Budget', 'Transport', 'Food', 'Activities']],
          body: tableData,
          startY: yPosition,
          theme: 'grid',
          styles: {
            cellPadding: 4,
            fontSize: 10,
            overflow: 'linebreak',
            lineColor: [44, 62, 80],
            fillColor: [255, 255, 255],
            textColor: [0, 0, 0],
            halign: 'left',
            valign: 'middle',
          },
          headStyles: {
            fillColor: [52, 152, 219],
            textColor: [255, 255, 255],
            fontSize: 12,
            halign: 'center',
          },
          columnStyles: {
            0: { cellWidth: 'auto' },
            1: { cellWidth: 40 },
            2: { cellWidth: 40 },
            3: { cellWidth: 40 },
            4: { cellWidth: 40 },
          },
        });

        yPosition = doc.lastAutoTable.finalY + 10;
      });
    }

    doc.save('expense_planner.pdf');
  };

  return (
    <div className="container-fluid p-4">
      <h1 className="text-center mb-4">Welcome to Travel Toes</h1>
      <p className="text-center mb-5">Your ultimate expense tracker and budget management tool.</p>

      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card shadow-sm">
            <div className="card-body">
              <div className="input-form">
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <input
                      type="text"
                      placeholder="Country"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="form-control"
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <input
                      type="text"
                      placeholder="State"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="form-control"
                    />
                  </div>
                </div>

                {cities.map((cityObj, index) => (
                  <div key={index} className="city-input mb-3">
                    <div className="row">
                      <div className="col-md-6 mb-2">
                        <input
                          type="text"
                          name="city"
                          placeholder="City"
                          value={cityObj.city}
                          onChange={(e) => handleCityChange(index, e)}
                          className="form-control"
                        />
                      </div>
                      <div className="col-md-6 mb-2">
                        <input
                          type="text"
                          name="places"
                          placeholder="List of Places (comma-separated)"
                          value={cityObj.places}
                          onChange={(e) => handleCityChange(index, e)}
                          className="form-control"
                        />
                      </div>
                      <div className="col-md-6 mb-2">
                        <input
                          type="number"
                          name="totalBudget"
                          placeholder="Total Budget"
                          value={cityObj.totalBudget}
                          onChange={(e) => handleCityChange(index, e)}
                          className="form-control"
                        />
                      </div>
                      <div className="col-md-6 mb-2">
                        <input
                          type="number"
                          name="days"
                          placeholder="Number of Days"
                          value={cityObj.days}
                          onChange={(e) => handleCityChange(index, e)}
                          className="form-control"
                        />
                      </div>
                      {/* Render delete button only for additional cities */}
                      {index > 0 && (
                        <div className="col-md-12 mb-2">
                          <button className="btn btn-danger" onClick={() => handleDeleteCity(index)}>
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                <div className="d-flex justify-content-between mt-3">
                  <button className="btn btn-outline-primary" onClick={handleAddCity}>
                    Add Another City
                  </button>
                  <button className="btn btn-primary" onClick={handleGeneratePlanner}>
                    Generate Expense Planner
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {expensePlan && (
        <div className="row justify-content-center mt-5">
          <div className="col-md-8">
            <div className="card shadow-sm">
              <div className="card-body">
                <h3 className="card-title text-center mb-4">Expense Planner</h3>
                {expensePlan.map((cityObj, index) => (
                  <div key={index} className="city-expense mb-4 text-center">
                    <h4>{cityObj.city} - Total Budget: ₹{cityObj.totalBudget} for {cityObj.days} Days</h4>
                    {cityObj.places.map((place, i) => (
                      <div key={i} className="place-expense mb-3">
                        <h5>{place.name} - Total Budget for Place: ₹{place.totalPlaceBudget}</h5>
                        <p>
                          Transport: ₹{place.transportBudget} | Food: ₹{place.foodBudget} | Activities: ₹{place.activitiesBudget}
                        </p>
                      </div>
                    ))}
                  </div>
                ))}
                <div className="text-center mt-4">
                  <button className="btn btn-success" onClick={handleDownloadPDF}>
                    Download PDF
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mt-5">
        <div className="card shadow-sm">
          <div className="card-body">
            <h5 className="text-center mb-3">To explore more, click on the below buttons:</h5>
            <div className="d-flex justify-content-center">
              <Link to="/expense-tracker" className="btn btn-primary me-3">
                Go to Expense Tracker
              </Link>
              <Link to="/budget" className="btn btn-secondary">
                Go to Budget Management
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
