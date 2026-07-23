import timetableService from "./timetableService.js";

export async function renderTimetableEditor() {

  const container = document.getElementById("timetableEditor");

  container.innerHTML = "Loading...";

  const timetable = await timetableService.getAllTimetable();

  console.log(timetable);

  container.innerHTML = "";

}