const express = require("express");
const app = new express();
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
app.use(express.json());
let db = null;
let dbPath = path.join(__dirname, "covid19India.db");

app.get("/states/", async (request, response) => {
  const query = `
    select state_id as stateId,state_name as stateName,population as population
    from state
    ;`;
  const result = await db.all(query);
  response.send(result);
});

app.get("/states/:stateId/", async (request, response) => {
  const { stateId } = request.params;
  const query = `
    select state_id as stateId,state_name as stateName,population as population
    from state
    where state_id =${stateId}
    ;`;
  const result = await db.get(query);
  response.send(result);
});

app.post("/districts/", async (request, response) => {
  try {
    const inp = request.body;
    const { districtName, stateId, cases, cured, active, deaths } = inp;
    const query = `
        Insert into District(district_name,state_id,cases,cured,active,deaths)
        values('${districtName}',${stateId},${cases},${cured},${active},${deaths});`;
    await db.run(query);
    response.send("District Successfully Added");
  } catch (error) {
    response.send(error);
  }
});

app.get("/districts/:districtId", async (request, response) => {
  const { districtId } = request.params;
  const query = `
    select district_id as  districtId,district_name as districtName,
    state_id as stateId,
    cases,
    cured,
    active,
    deaths
    from district
    where district_id=${districtId};`;
  const result = await db.get(query);
  response.send(result);
});

app.delete("/districts/:districtId", async (request, response) => {
  try {
    const { districtId } = request.params;
    const query = `
        delete from district 
        where district_id=${districtId};`;
    await db.run(query);
    response.send("District Removed");
  } catch (error) {
    console.log("error");
  }
});

app.put("/districts/:districtId", async (req, res) => {
  try {
    const dt = req.body;
    const { districtName, stateId, cases, cured, active, deaths } = dt;
    const quer = `
        update district
        set 
        district_name='${districtName}',
        state_id=${stateId},
        cases=${cases},
        cured=${cured},
        active=${active},
        deaths=${deaths}
        `;
    await db.run(quer);
    res.send("District Details Updated");
  } catch (err) {
    console.log(err);
  }
});

app.get("/states/:stateId/stats/", async (req, res) => {
  try {
    const { stateId } = req.params;
    const qu = `
        select sum(cases) as totalCases,sum(cured) as totalCured,
        sum(active) as totalActive,
        sum(deaths) as totalDeaths
        from district 
        where state_id=${stateId};`;
    // const qu=`
    // select sum(cases) as totalCases,sum(cured) as totalCured,
    // sum(active) as totalActive,
    // sum(deaths) as totalDeaths
    // from district
    // where state_id=${stateId};`;
    const result = await db.get(qu);
    res.send(result);
  } catch (error) {
    console.log(error);
  }
});
app.get("/districts/:districtId/details/",async(req,res)=>{
    try 
    {
        const {districtId}=req.params;
        const query=`
        select state_name as stateName
        from state
        where state_id in (select state_id from district where district_id=${districtId});`;
        const result=await db.get(query);
        res.send(result);
    } 
    catch (error) 
    {
        console.log(error);
    }
});

const initializeDBandserver = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    console.log("DB Connected Successfully");
    app.listen(3000, () => {
      console.log("Servor running at http://localhost:3000/");
    });
  } catch (error) {
    console.log(error);
  }
};
initializeDBandserver();

module.exports = app;
