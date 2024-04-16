let cities = []
let person = []
let specializations = []

Promise.all([
	fetch('cities.json'),
	fetch('person.json'),
	fetch('specializations.json'),
])
	.then(async ([citiesResponse, personResponse, specializationsResponse]) => {
		const citiesJson = await citiesResponse.json()
		const personJson = await personResponse.json()
		const specializationsJson = await specializationsResponse.json()
		return [citiesJson, personJson, specializationsJson]
	})
	.then(response => {
		cities = response[0]
		person = response[1]
		specializations = response[2]

		searchForAllDesigners()
		searchDeveloper()
		isAdult()
		searchBackendDeveloper()
		searchDesignerSixthLvl()
		searchPerfectTeam()
	})

function searchForAllDesigners() {
	let designer = searchSpecialization('designer')

	if (designer) {
		let result = person
			.filter(item => {
				return item.personal.specializationId === designer.id
			})
			.filter(item => {
				return item.skills.find(
					itemSkill => itemSkill.name.toLowerCase() === 'figma'
				)
			})
		replaceLocation.call(result).forEach(item => getInfo.call(item))
	}
}

function searchDeveloper() {
	let reactDeveloper = Array(
		person.find(item =>
			item.skills.find(skillItem => skillItem.name.toLowerCase() === 'react')
		)
	)

	replaceLocation.call(reactDeveloper).forEach(item => getInfo.call(item))
}

function isAdult() {
	let underage = person.filter(item => {
		let dateParts = item.personal.birthday.split('.')
		let birthday = new Date(dateParts[2], dateParts[1], dateParts[0])

		return (
			(((new Date().getTime() - birthday) / (24 * 3600 * 365.25 * 1000)) | 0) <
			18
		)
	})

	if (underage.length === 0) {
		console.log('Все пользователи старше 18 лет.')
	} else {
		console.log('Пользователи младше 18 лет:')
		replaceLocation.call(underage).forEach(item => getInfo.call(item))
	}
}

function searchBackendDeveloper() {
	let specialization = searchSpecialization('backend')
	let city = cities.find(cityItem => cityItem.name.toLowerCase() === 'москва')

	if (specialization && city) {
		let result = person
			.filter(item => {
				return (
					item.personal.locationId === city.id &&
					item.personal.specializationId === specialization.id
				)
			})
			.filter(item => {
				let type = item.request.find(
					reqItem => reqItem.name.toLowerCase() === 'тип занятости'
				)

				if (type && type.value) {
					return type.value.toLowerCase() === 'полная'
				}
				return false
			})
			.sort((item_one, item_two) => {
				let salary_one = item_one.request.find(
					salaryItem => salaryItem.name.toLowerCase() === 'зарплата'
				)

				let salary_two = item_two.request.find(
					salaryItem => salaryItem.name.toLowerCase() === 'зарплата'
				)

				return salary_one.value - salary_two.value
			})

		console.log(result)
	}
}

function searchPerfectTeam() {
	let designerSpec = searchSpecialization('designer')
	let frontendSpec = searchSpecialization('frontend')
	let backendSpec = searchSpecialization('backend')

	let designer = person
		.filter(item => {
			return item.personal.specializationId === designerSpec.id
		})
		.filter(item => {
			return item.skills.find(
				itemSkill => itemSkill.name.toLowerCase() === 'figma'
			)
		})
		.reduce((acc, item) => {
			if (!acc) {
				acc = item
			}

			let figmaPrevLvl = acc.skills.find(
				itemSkill => itemSkill.name.toLowerCase() === 'figma'
			)

			let figmaCurrentLvl = item.skills.find(
				itemSkill => itemSkill.name.toLowerCase() === 'figma'
			)

			if (figmaCurrentLvl.level) {
				return figmaCurrentLvl.level > figmaPrevLvl.level ? item : acc
			}
		})

	let frontend = person
		.filter(item => {
			return item.personal.specializationId === frontendSpec.id
		})
		.filter(item => {
			return item.skills.find(
				itemSkill => itemSkill.name.toLowerCase() === 'angular'
			)
		})
		.reduce((acc, item) => {
			let angularPrevLvl = acc.skills.find(
				itemSkill => itemSkill.name.toLowerCase() === 'angular'
			)

			let angularCurrentLvl = item.skills.find(
				itemSkill => itemSkill.name.toLowerCase() === 'angular'
			)

			if (angularCurrentLvl.level) {
				return angularCurrentLvl.level > angularPrevLvl.level ? item : acc
			}
		})

	let backend = person
		.filter(item => {
			return item.personal.specializationId === backendSpec.id
		})
		.filter(item => {
			return item.skills.find(
				itemSkill => itemSkill.name.toLowerCase() === 'go'
			)
		})
		.reduce((acc, item) => {
			let goPrevLvl = acc.skills.find(
				itemSkill => itemSkill.name.toLowerCase() === 'go'
			)

			let goCurrentLvl = item.skills.find(
				itemSkill => itemSkill.name.toLowerCase() === 'go'
			)

			if (goCurrentLvl.level) {
				return goCurrentLvl.level > goPrevLvl.level ? item : acc
			}
		})

	console.log('Лучшая команда:')
	console.log('Дизайнер:')
	replaceLocation.call([designer]).forEach(item => getInfo.call(item))
	console.log('Frontend:')
	replaceLocation.call([frontend]).forEach(item => getInfo.call(item))
	console.log('Backend:')
	replaceLocation.call([backend]).forEach(item => getInfo.call(item))
}

function searchDesignerSixthLvl() {
	let specialization = searchSpecialization('designer')

	let result = person.filter(item => {
		let figma = item.skills.find(
			itemSkill => itemSkill.name.toLowerCase() === 'figma'
		)
		let photoshop = item.skills.find(
			itemSkill => itemSkill.name.toLowerCase() === 'photoshop'
		)

		if (photoshop && figma) {
			return photoshop.level >= 6 && figma.level >= 6
		}
	})

	console.log(result)
}

function searchSpecialization(name) {
	return specializations.find(item => item.name.toLowerCase() === name)
}

function getInfo() {
	console.log(
		`${this.personal.firstName} ${this.personal.lastName}, ${this.personal.location}`
	)
}

function replaceLocation() {
	return this.map(item => {
		let city = cities.find(cityItem => item.personal.locationId === cityItem.id)

		if (city && city.name) {
			item.personal.location = city.name
		}
		delete item.personal.locationId

		return item
	})
}
