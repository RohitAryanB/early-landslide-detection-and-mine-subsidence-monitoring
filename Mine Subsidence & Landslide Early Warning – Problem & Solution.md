# Mine Subsidence & Landslide Early Warning Detection System

## Problem Description and Proposed Solution (Updated)

## 1. Background

Surface subsidence caused by underground coal mining poses significant risks to nearby communities, public infrastructure, agricultural land, forest areas, and the surrounding environment. Closely related to this is the risk of **landslides**, which frequently occur on mine overburden dumps, excavated slopes, benches, and hill slopes adjacent to mining areas — often triggered by the same underlying ground destabilization, as well as by rainfall and slope saturation.

In India, both subsidence and landslide monitoring are still largely dependent on conventional field observations, periodic surveys, and post-facto damage assessments, which often fail to provide timely warning before critical ground failure occurs.

There is a strong need for an indigenous, low-cost, intelligent, and real-time monitoring solution capable of detecting early signs of **both ground subsidence and slope/landslide instability**, enabling proactive risk mitigation. Such a system should be affordable, scalable, and deployable across Indian underground coal mines and their surrounding slopes using widely accessible technologies, supporting the national vision of smart and sustainable mining.

## 2. Problem Description

Underground mining removes material from below the ground. Because of this, the ground above the mining area can gradually become unstable, and nearby slopes (overburden dumps, excavated benches, hill slopes bordering the mine) become more prone to landslides — especially during or after rainfall.

Before a major ground failure, subsidence event, or landslide, there are usually small, gradual changes, such as:

- Slight ground movement or slope creep
- Small surface displacement
- Tilting of the ground or slope face
- Cracks or widening of existing cracks (tension cracks at slope crowns are a classic landslide precursor)
- Rising soil moisture / pore water pressure after rainfall, which reduces slope stability
- Unusual vibration signatures
- Gradual deformation of the ground or slope over weeks to months

The core problem is that these early warning signs are often too subtle to be noticed by people in time, and conventional monitoring (periodic manual surveys) is too infrequent to catch a fast-developing landslide or a progressively worsening subsidence zone.

The problem therefore has **two closely linked but distinct failure modes** that the system must address:

1. **Subsidence** — slow, vertical/gradual ground settlement above underground mine panels.
2. **Landslide** — comparatively faster slope failure on mine dumps, cut slopes, or hill slopes near the mine, often rainfall-triggered.

## 3. Proposed Solution

The proposed solution is an AI-enabled smart ground monitoring and early-warning platform based on a localized wireless surface mesh sensor network, deployed both **above underground mine panels** (for subsidence) and **on slopes, dumps, and benches** (for landslide risk) in and around the mining area.

### 3.1 Sensor nodes

Distributed, low-cost smart sensor nodes are installed across the surface over the mining area and along at-risk slopes. Each node may carry:

- Tilt/inclination sensors
- Vibration/accelerometer sensors (ground and slope movement)
- Displacement/stretch sensors
- Crack detection sensors (including crack-width/extensometer sensors at slope crowns)
- **Soil moisture / pore-water-pressure sensors** — key for landslide prediction, since most landslides are rainfall-triggered
- **Rain gauges / rainfall intensity sensors** at the site, to correlate rainfall with slope saturation
- **Slope angle / inclinometer strings** at depth, to detect sub-surface shear movement before it reaches the surface
- Optional low-cost positioning (GNSS/RTK) modules for precise displacement tracking over time

### 3.2 Wireless mesh network

Nodes communicate through a wireless mesh network (LoRa/Zigbee/Wi-Fi mesh), enabling continuous, real-time monitoring of micro ground movements over both the mine panel and surrounding slopes, even in areas with poor connectivity.

### 3.3 Continuous detection

The system continuously detects:

- Abnormal ground or slope tilt
- Change in relative distance/displacement between nodes
- Early crack initiation and crack growth rate
- Unusual vibration signatures
- **Rising soil moisture/pore pressure trends that precede slope failure**
- **Rainfall accumulation against site-specific triggering thresholds**

### 3.4 AI/ML layer — dual prediction models

Using Artificial Intelligence / Machine Learning, the platform runs **two complementary prediction models**:

**A. Subsidence model**

- Identifies abnormal deformation patterns over mine panels
- Predicts possible subsidence zones
- Estimates severity and progression over time (e.g., Month 1 → small change, Month 2 → slightly larger, Month 3 → increasing, Month 4 → significant)

**B. Landslide model**

- Combines rainfall, soil moisture/pore pressure, slope angle, and displacement data to estimate slope failure probability
- Applies rainfall-intensity-duration threshold logic (a well-established landslide-triggering approach) alongside sensor trend analysis
- Flags accelerating slope creep (a known precursor to sudden slope failure) distinct from the slower subsidence trend
- Optionally ingests satellite InSAR ground-deformation data where available, to cross-check ground-based sensor readings over a wider area

Both models generate automated early-warning alerts and support timely operational decisions, with the system clearly distinguishing **subsidence risk** from **landslide risk** in its alerts, since the two require different operator responses.

### 3.5 Warning flow

```
Ground/slope changes
      ↓
Monitoring node detects it
      ↓
Data sent wirelessly over mesh
      ↓
AI/ML engine classifies trend
 (Subsidence trend vs. Landslide trend)
      ↓
Owner / Mine control room
      ↓
⚠️ Early warning
   e.g. "Increasing ground movement detected in Zone A"
   e.g. "Slope saturation + crack growth indicates elevated landslide risk, Dump Slope B"
```

This gives the operator the opportunity to inspect the area and take safety measures before a serious subsidence or landslide event occurs.

### 3.6 Solar-powered system

Solar street lights double as power infrastructure for the monitoring network, addressing poor lighting and electrical access in mining areas:

```
Solar Panel
     ↓
Battery
     ↓
Street Light + Monitoring Node
```

The battery charged during the day keeps the monitoring system running at night, and the lights improve on-site visibility and safety — particularly valuable near landslide-prone slopes where night-time inspection is otherwise risky.

### 3.7 GIS visualization and alerts

- GIS-based visualization of live deformation maps and risk zones, with **separate layers for subsidence risk and landslide risk**
- Automated early warning alerts via SMS/email/mobile app notifications
- Interactive dashboards for mine operators, planners, and regulators
- Offline capability with periodic cloud synchronization
- Scalable deployment across multiple underground coalfields and their surrounding slopes

## 4. End-to-end flow

```
UNDERGROUND MINING
        ↓
Changes in underground structure
        ↓
Small changes begin at the surface AND on nearby slopes
        ↓
Ground + slope monitoring nodes detect them
        ↓
Measurements collected continuously
 (tilt, displacement, cracks, vibration,
  soil moisture, rainfall, slope angle)
        ↓
AI/ML engine evaluates two trends in parallel
        ↓
   Subsidence trend          Landslide trend
 (slow, cumulative)      (rainfall/pore-pressure driven,
                            can accelerate quickly)
        ↓                          ↓
        └───────────┬──────────────┘
                     ↓
          ⚠️ EARLY WARNING (type-specific)
                     ↓
          Mine owner/operator
                     ↓
          Inspection + safety action
```

## 5. Core idea (updated)

A solar-powered ground and slope monitoring system for underground mining areas that detects small and increasing **ground deformation (subsidence)** as well as **rainfall- and moisture-driven slope instability (landslide risk)**, using a shared low-cost sensor mesh and a dual AI/ML prediction engine — sending type-specific early warnings to mine operators before either a subsidence collapse or a slope failure becomes serious. This positions the project as a unified, indigenous, Made-in-India geo-hazard early-warning platform for mining areas, rather than a subsidence-only solution.
