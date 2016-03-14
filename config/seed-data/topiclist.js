module.exports = [
{
pillar:'Environment',
type:'Valued Component',
description:'Air quality',
name:'Air quality',
code:'environment-air-quality'
},
{
pillar:'Environment',
type:'Valued Component',
description:'Greenhouse gas emissions',
name:'Greenhouse gas emissions',
code:'environment-greenhouse-gas-emissions'
},
{
pillar:'Environment',
type:'Valued Component',
description:'Soils',
name:'Soils',
code:'environment-soils'
},
{
pillar:'Environment',
type:'Valued Component',
description:'Terrain',
name:'Terrain',
code:'environment-terrain'
},
{
pillar:'Environment',
type:'Pathway Component',
description:'Vegetation',
name:'Vegetation',
code:'environment-vegetation'
},
{
pillar:'Environment',
type:'Valued Component',
description:'Wetlands',
name:'Wetlands',
code:'environment-wetlands',
parent:'environment-vegetation'
},
{
pillar:'Environment',
type:'Valued Component',
description:'Riparian',
name:'Riparian',
code:'environment-riparian',
parent:'environment-vegetation'
},
{
pillar:'Environment',
type:'Valued Component',
description:'Grasslands',
name:'Grasslands',
code:'environment-grasslands',
parent:'environment-vegetation'
},
{
pillar:'Environment',
type:'Valued Component',
description:'Alpine',
name:'Alpine',
code:'environment-alpine',
parent:'environment-vegetation'
},
{
pillar:'Environment',
type:'Valued Component',
description:'Forests (including old growth)',
name:'Forests (including old growth)',
code:'environment-forests-including-old-growth',
parent:'environment-vegetation'
},
{
pillar:'Environment',
type:'Valued Component',
description:'Rare plants',
name:'Rare plants',
code:'environment-rare-plants',
parent:'environment-vegetation'
},
{
pillar:'Environment',
type:'Pathway Component',
description:'Wildlife (terrestrial)',
name:'Wildlife (terrestrial)',
code:'environment-wildlife-terrestrial'
},
{
pillar:'Environment',
type:'Valued Component',
description:'Mammals',
name:'Mammals',
code:'environment-mammals',
parent:'environment-wildlife-terrestrial'
},
{
pillar:'Environment',
type:'Valued Component',
description:'Amphibians',
name:'Amphibians',
code:'environment-amphibians',
parent:'environment-wildlife-terrestrial'
},
{
pillar:'Environment',
type:'Valued Component',
description:'Reptiles',
name:'Reptiles',
code:'environment-reptiles',
parent:'environment-wildlife-terrestrial'
},
{
pillar:'Environment',
type:'Valued Component',
description:'Birds',
name:'Birds',
code:'environment-birds',
parent:'environment-wildlife-terrestrial'
},
{
pillar:'Environment',
type:'Valued Component',
description:'Bats',
name:'Bats',
code:'environment-bats',
parent:'environment-wildlife-terrestrial'
},
{
pillar:'Environment',
type:'Pathway Component',
description:'Freshwater fish and fish habitat',
name:'Freshwater fish and fish habitat',
code:'environment-freshwater-fish-and-fish-habitat'
},
{
pillar:'Environment',
type:'Valued Component',
description:'Freshwater fish',
name:'Freshwater fish',
code:'environment-freshwater-fish',
parent:'environment-freshwater-fish-and-fish-habitat'
},
{
pillar:'Environment',
type:'Valued Component',
description:'Benthic invertebrates',
name:'Benthic invertebrates',
code:'environment-benthic-invertebrates',
parent:'environment-freshwater-fish-and-fish-habitat'
},
{
pillar:'Environment',
type:'Pathway Component',
description:'Marine resources',
name:'Marine resources',
code:'environment-marine-resources'
},
{
pillar:'Environment',
type:'Valued Component',
description:'Marine mammals',
name:'Marine mammals',
code:'environment-marine-mammals',
parent:'environment-marine-resources'
},
{
pillar:'Environment',
type:'Valued Component',
description:'Surface water (quality/quantity)',
name:'Surface water (quality/quantity)',
code:'environment-surface-water'
},
{
pillar:'Environment',
type:'Valued Component',
description:'Groundwater (quality/quantity)',
name:'Groundwater (quality/quantity)',
code:'environment-groundwater'
},
{
pillar:'Environment',
type:'Valued Component',
description:'Acoustics',
name:'Acoustics',
code:'environment-acoustics'
},
{
pillar:'Economic',
type:'Valued Component',
code:'economic-labour-force',
name:'Labour force',
description:'Labour force'
},
{
pillar:'Economic',
type:'Valued Component',
code:'economic-employment-and-income',
name:'Employment and income',
description:'Employment and income'
},
{
pillar:'Economic',
type:'Valued Component',
code:'economic-land-and-resource-use',
name:'Land and resource use',
description:'Land and resource use'
},
{
pillar:'Economic',
type:'Valued Component',
code:'economic-land-and-resource-use-for-traditional-purposes',
parent: 'economic-land-and-resource-use',
name:'Land and resource use for traditional purposes',
description:'Land and resource use for traditional purposes (includes this and others)'
},
{
pillar:'Economic',
type:'Valued Component',
code:'economic-community-well-being',
name:'Community well-being',
description:'Community well-being'
},
{
pillar:'Economic',
type:'Valued Component',
code:'economic-services-and-infrastructure',
name:'Services and infrastructure',
description:'Services and infrastructure'
},
{
pillar:'Economic',
type:'Valued Component',
code:'economic-transportation-and-access',
parent: 'economic-services-and-infrastructure',
name:'Transportation and access',
description:'Transportation and access (includes this and others)'
},
{
pillar:'Economic',
type:'Valued Component',
code:'economic-marine-transportation-and-use',
name:'Marine transportation and use',
description:'Marine transportation and use'
},
{
pillar:'Social',
type:'Valued Component',
code:'social-labour-force',
name:'Labour force',
description:'Labour force'
},
{
pillar:'Social',
type:'Valued Component',
code:'social-employment-and-income',
name:'Employment and income',
description:'Employment and income'
},
{
pillar:'Social',
type:'Valued Component',
code:'social-land-and-resource-use',
name:'Land and resource use',
description:'Land and resource use'
},
{
pillar:'Social',
type:'Valued Component',
code:'social-land-and-resource-use-for-traditional-purposes',
parent:'social-land-and-resource-use',
name:'Land and resource use for traditional purposes',
description:'Land and resource use for traditional purposes (includes this and others)'
},
{
pillar:'Social',
type:'Valued Component',
code:'social-community-well-being',
name:'Community well-being',
description:'Community well-being'
},
{
pillar:'Social',
type:'Valued Component',
code:'social-services-and-infrastructure',
name:'Services and infrastructure',
description:'Services and infrastructure'
},
{
pillar:'Social',
type:'Valued Component',
code:'social-transportation-and-access',
parent:'social-services-and-infrastructure',
name:'Transportation and access',
description:'Transportation and access (includes this and others)'
},
{
pillar:'Social',
type:'Valued Component',
code:'social-marine-transportation-and-use',
name:'Marine transportation and use',
description:'Marine transportation and use'
},
{
pillar:'Social',
type:'Valued Component',
code:'social-visual-quality',
name:'Visual quality',
description:'Visual quality'
},
{
pillar:'Social',
type:'Valued Component',
code:'social-odour',
name:'Odour',
description:'Odour'
},
{
pillar:'Social',
type:'Valued Component',
code:'social-acoustics',
name:'Acoustics',
description:'Acoustics'
},
{
pillar:'Health',
type:'Valued Component',
code:'health-human-health',
name:'Human health',
description: 'Human health'
},
{
pillar:'Health',
type:'Valued Component',
code:'health-human-health-risk-assessment',
parent: 'health-human-health',
name:'Human health risk assessment',
description: 'Human health risk assessment (includes this and others)'
},
{
pillar:'Health',
type:'Valued Component',
code:'health-drinking-water',
name:'Drinking water',
description: 'Drinking water'
},
{
pillar:'Health',
type:'Valued Component',
code:'health-air-quality',
name:'Air quality',
description: 'Air quality'
},
{
pillar:'Health',
type:'Valued Component',
code:'health-country-foods',
name:'Country foods',
description: 'Country foods'
},
{
pillar:'Health',
type:'Valued Component',
code:'health-acoustics',
name:'Acoustics',
description: 'Acoustics'
},
{
pillar:'Heritage',
type:'Valued Component',
code:'heritage-archaeological-resources',
name:'Archaeological resources',
description:'Archaeological resources'
},
{
pillar:'Heritage',
type:'Valued Component',
code:'heritage-heritage-resources',
name:'Heritage resources',
description:'Heritage resources'
},
{
pillar:'Heritage',
type:'Valued Component',
code:'heritage-palaeontological-resources',
name:'Palaeontological resources',
description:'Palaeontological resources'
},
];
