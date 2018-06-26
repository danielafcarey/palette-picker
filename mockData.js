const projects = [
  {
    id: '1',
    name: 'Project 1',
  },
  {
    id: '2',
    name: 'Project 2',
  },
  {
    id: '3',
    name: 'Project 3',
  }
]

const palettes = [
  {
    id: '1',
    name: 'Greens',
    project_id: '1',
    colors: [
      '#C44E3B',
      '#2C73C4',
      '#877073',
      '#2EED84',
      '#B596BE'
    ]
  },
  {
    id: '2',
    name: 'Dingus',
    project_id: '1',
    colors: [
      '#42499E',
      '#9E9FD8',
      '#D44665',
      '#D3A83B',
      '#98591A'
    ]
  },
  {
    id: '3',
    name: 'Mashed Peas',
    project_id: '2',
    colors: [
      '#766F2B',
      '#585155',
      '#1D87ED',
      '#571C03',
      '#4ABACD'
    ]
  },
  {
    id: '4',
    name: 'Pukes',
    project_id: '3',
    colors: [
      '#A2F98D',
      '#F753EB',
      '#CA62A7',
      '#198C51',
      '#6E1DE7'
    ]
  }
]

module.exports = {
  projects,
  palettes
}
