import React,{useState,useEffect} from 'react'
import * as dateFns from "date-fns"
import "../styles/Calendar.css"
import axios from "axios"

const formatofYear = 'yyy';
const formatofMonth = "MMM";
const formatofWeek = "eeee";
const formatofDay = "dd"
const localbackend = "http://localhost:7001/api/v1"
const api = axios.create({
    baseURL: localbackend, // Replace with your backend URL
});

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectDate, setSelectDate] = useState(new Date());
  const [isModalOpen,setIsModalOpen] = useState(false);
  const [toggleValue, setToggleValue] = useState('absent');
  const [attendaceData, setAttendanceData] = useState(null)
  const [listData,setListData] = useState([])
  const today = new Date();

  // Find the first day of the currentDate
  const firstDay = dateFns.startOfMonth(currentDate);
  // Find the last day of the currentDate
  // Find the first day of the currentDate
  const lastDay = dateFns.lastDayOfMonth(currentDate);
  // Find the last day of the currentDate
  // Find the first day of the currentDate
  const startDate = dateFns.startOfWeek(currentDate);
  // Find the last day of the currentDate
  // Find the first day of the currentDate
  const endDate = dateFns.endOfWeek(currentDate);
  // Find the last day of the currentDate
  const totaldate = dateFns.eachDayOfInterval({start : firstDay, end : lastDay});

  const weeks = (date => {
    const weeks = [];
    for (let day = 0; day < 7 ; day++) {
        weeks.push(date[day]);
    }
    return weeks;
  })(totaldate);

  useEffect(() => {
    fetchAttendanceData();
  }, [currentDate]); // Fetch data when the month changes

  const isToday = day => dateFns.isSameDay(day,today);
  const isSelectedDate = day => dateFns.isSameDay(day,selectDate)


const handleToggle = async () => {
  try {
    const updatedToggleValue = toggleValue === 'absent' ? 'present' : 'absent';

    const data = {
      date: selectDate,
      status: updatedToggleValue, // Use the updated toggle value
    };

    console.log(data);
    // the url will take the userID in the params
    const response = await api.post("att/mark/H9hIAHI", data);

    console.log(response);

    // Update the toggle value after the successful POST request
    setToggleValue(updatedToggleValue);
  } catch (error) {
    console.log(error);
  }
};


  const handleDateClick = (date)=>{
    setSelectDate(date);
    // Format the selected date to match the database date format
    const formattedDate = dateFns.format(date, 'yyyy-MM-dd');
      // Format the date values in listData to match the same format
    const formattedListData = listData.map((item) => {
        const dateObject = new Date(item.date);
        const formattedDateString = dateFns.format(dateObject, 'yyyy-MM-dd');
        console.log((formattedDateString));
        return { ...item, date: formattedDateString };
    });
    


    let selectedDateData = null;

    for (const dateData of formattedListData) {
        if (dateData.date === formattedDate) {
        selectedDateData = dateData;
        break; // Exit the loop as soon as a match is found
        }
    }

    console.log('selectedDateData:', selectedDateData);
     if (selectedDateData) {
    // If matching data is found, set the toggle value and open the modal
        setToggleValue(selectedDateData.status);
    } else {
        // If no matching data is found, set a default value for the toggle
        setToggleValue('absent'); // Adjust this to your actual default value
    }
    setIsModalOpen(true)
}
   const openModal = (date) => {
    setIsModalOpen(true)
    setSelectDate(date);
  };

  const closeModal = () => {
    setIsModalOpen(false)
    setSelectDate(null);
  };
  const fetchAttendanceData = async() => {
    try {
        const {data} = await api.get("att/get/H9hIAHI")
        setListData(data)
        console.log(listData);
    } catch (error) {
        throw new Error("cant get the data")
    }
  }


  
return (
  <div>
    <div style={{ display: "flex", justifyContent: "space-around", margin: "1rem 0" }}>
      <button onClick={() => setCurrentDate(dateFns.subMonths(currentDate, 1))}>Previous</button>
      <span>
        {dateFns.format(currentDate, formatofMonth)} {dateFns.format(currentDate, formatofYear)}
      </span>
      <button onClick={() => setCurrentDate(dateFns.addMonths(currentDate, 1))}>Next</button>
    </div>
    <div style={{ display: "grid", gridTemplateColumns: 'repeat(7, 1fr)', gap: "1rem" }}>
        {weeks.map(week =>(
            <span>{dateFns.format(week,formatofWeek)}</span>
        ))}

      {totaldate.map((date, index) => (
        <div key={index} className='date-box' onClick={() =>handleDateClick(date)}>
          <span
            style={{
              color: !dateFns.isSameMonth(date, currentDate)
                ? "#ddd"
                : isSelectedDate(date)
                ? "blue"
                : isToday(date)
                ? "green"
                : dateFns.isWeekend(date)
                ? "red"
                : ""
            }}
          >
            {dateFns.format(date, formatofDay)}
          </span>
        </div>
      ))}
    </div>
    {isModalOpen && (
        <div className="modal-popup">
            <div className="modal-popup-content">
            {/* Your modal content */}
            <h2>Date: {dateFns.format(selectDate, 'MMM dd, yyyy')}</h2>
            <label>
              Attendance: {toggleValue}
                <button
                    className={`toggle-button ${toggleValue === 'absent' ? 'absent' : 'present'}`}
                    onClick={handleToggle}
                >
                    {toggleValue === 'absent' ? 'Present' : 'Absent'}
                </button>
            </label>
            <button className="close-button" onClick={closeModal}>Close</button>
            </div>
        </div>
     )}
  </div>
);


}

export default Calendar