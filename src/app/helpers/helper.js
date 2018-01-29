/* global Set */
import moment from 'moment';
import {countries} from 'country-data';

export function getRandomString() {
  // https://stackoverflow.com/questions/1349404/generate-random-string-characters-in-javascript
  return Math.random().toString(36).replace(/[^a-z]+/g, '');
}

const embargoedCountries = [
  'SY', // Syria
  'IR', // Iran
  'KP', // North Korea
  'SS', // South Sudan
  'SD', // Sudan
  'RS', // Serbia
  'BA', // Bosnia & Herzegovina
  'MD', // Moldova
  'ME', // Montenegro
  'IQ', // Iraq
  'LB', // Lebanon
  'LY', // Libya
  'SO', // Somalia
  'BI', // Burundi
  'BU', // Burma
  'BY', // Belarus
  'CD', // Democratic Republic of Congo
  'CF', // Central African Republic
  'CU', // Cuba
  'ZW'  // Zimbabwe
];

function getApplicableCountries() {
  const filtered = countries.all.filter(c => {
    const isEmbargoed = embargoedCountries.includes(c.alpha2);
    return !isEmbargoed && c.status.includes('assigned');
    // c.status is referring to the ISO 3166 standard. Options are:
    // assigned - properly in ISO 3166
    // reserved - code is prevented from being used
    // deleted  - used to be in ISO 3166 but has been deleted
    // user assigned - for some use cases it is required
  });
  // sort alphabetically by name
  return _.sortBy(filtered, ['name']);
}

export function getCountriesForDropdown() {
  /* returns options for selector with countries that don't support paypal
   * payments from the US as un-clickable options
   */
  const applicableCountries = getApplicableCountries();
  return applicableCountries.map(country => {
    return {
      value: country.alpha2,
      label: `${country.name} ${country.emoji}`
    };
  });
}

export function getNdsToAdd(degreeIds=[], allDegrees=[]) {
  const formDegrees = allDegrees.filter(d => degreeIds.includes(d.key));
  const degreesToAdd = _.difference(allDegrees, formDegrees);

  return degreesToAdd.map(nd => ({
    value: nd.key,
    label: `${nd.key} - ${nd.title}`
  }));
}

export function getReadableDay(dayOfTheWeek) {
  const day = moment().day(dayOfTheWeek.day_index).format('dddd[s]');
  return `${day} ${dayOfTheWeek.start_time} - ${dayOfTheWeek.end_time} ${moment().tz(dayOfTheWeek.time_zone_id).format('z')}`;
}

export function getNumbersForSelect(min = 0, max = 100, interval = 1) {
  const arrayLength = Math.ceil((max - min + 1)/interval);
  return Array.from(new Array(arrayLength), (x, i) => {
    return {
      value: i * interval + min,
      label: i * interval + min
    };
  });
}

export function getTimezonesForSelect() {
  return moment.tz.names().map(tz => ({
    value: tz,
    label: tz
  }));
}

export function getValuesForSelect(array) {
  if (array) {
    return array.map(item => {
      return {
        value: item.id,
        label: item.name,
        clearableValue: false
      };
    });
  }
}

export function getSessionsForSelect(sessions) {
  const activeSessions = sessions.filter(s => s.active);
  return activeSessions.map(session => {
    return {
      value: session.id,
      label: `${session.id}: ${session.name} @ ${session.location.name}`
    };
  });
}

export function getDeadlinesForSelect(deadlines) {
  return _.map(deadlines, deadline => {
    return {
      value: deadline.key,
      label: `${deadline.project ? 'project' : 'quiz'}: ${deadline.title}`
    };
  });
}

export function mapDeadlinesToInstances(instances, deadlines, ndParts) {
  return _.reduce(instances, (deadlineStore, instance) => {
    const deadline = _.find(deadlines, {instance_id: instance.id});
    const deadlineNodes = _.get(deadline, 'nodes');
    const deadlineKeys = _.map(deadlineNodes, 'key');
    const deadlineTitles = _.map(deadlineKeys, key => {
      const ndPart = _.find(ndParts, {key});
      const type = _.get(ndPart, 'project') ? 'project' : 'quiz';
      return `${type} ${_.get(ndPart, 'title')}`;
    });
    return {
      ...deadlineStore,
      [instance.id]: {
        keys: deadlineKeys,
        titles: deadlineTitles
      } 
    };
  }, {});
}

export function buildDeadlineObject(deadlineStore) {
  const allInstanceDeadlines = _.map(deadlineStore, (keysObj, instanceId) => {
    return {
      instance_id: instanceId,
      nodes: _.map(keysObj.keys, (key, index) => {
        const title = keysObj.titles[index];
        // I'm putting whether the deadline is a quiz or project as the first
        // word in the title
        const type = title.split(' ')[0];
        return {
          type,
          key
        };
      })
    };
  });

  return _.filter(allInstanceDeadlines, dl => dl.nodes.length);
}

export function getValuesForWeekday() {
  return [
    {
      value: 1,
      label: 'Monday'
    },
    {
      value: 2,
      label: 'Tuesday'
    },
    {
      value: 3,
      label: 'Wednesday'
    },
    {
      value: 4,
      label: 'Thursday'
    },
    {
      value: 5,
      label: 'Friday'
    },
    {
      value: 6,
      label: 'Saturday'
    },
    {
      value: 7,
      label: 'Sunday'
    }
  ];
}

export function getDegreesAddedAndRemoved(degrees, formDegrees) {
  const degreesSet = new Set(degrees);
  const formDegreesSet = new Set(formDegrees);

  const degrees_to_add = formDegrees.filter(nd => !degreesSet.has(nd));
  const degrees_to_remove = degrees.filter(nd => !formDegreesSet.has(nd));

  return {degrees_to_add, degrees_to_remove};
}

export function listAllLocations(locationsByCity) {
  let locations = [];
  const cities = Object.values(locationsByCity);
  if (cities.length) {
    locations = cities.reduce((first, next) => {
      return [...first, ...next];
    });
  }

  return locations;
}

export function getValuesForProductType() {
  return [
    {
      value: 'subscription',
      label: 'Subscription'
    },
    {
      value: 'intensive',
      label: 'Intensive'
    }
  ];
}

export function getSessionInstanceDates({startDate, endDate, holidays, daysOfTheWeek}) {
  // sunday funday - seems that moment uses 0 for sunday while uhome-api is using 7
  const dayIndices = daysOfTheWeek.map(d => d.day_index % 7);
  let date = moment(startDate);
  let allDates = [];
  while (date.isSameOrBefore(moment(endDate))) {
    const formatted = date.format('YYYY-MM-DD');
    if (dayIndices.includes(date.weekday()) && !holidays.includes(formatted)) {
      allDates.push(formatted);
    }
    date.add(1, 'day');
  }
  return allDates;
}

export function correctBraavosSku(skuInput) {
  // skus are always in the format
  // urn:x-udacity:sku:simple:<sku_id_number>
  // if the admin only has access to the sku_id_number, correct for that input.
  if (isNaN(+skuInput)) {
    return skuInput;
  }

  return `urn:x-udacity:sku:simple:${skuInput}`;
}

export function getSkuFromFromFullUri(sku_uri) {
  const parts = sku_uri.split(':');
  return _.last(parts);
}

