import {connect}                from 'react-redux';
import {Localized}              from 'fluent-react/compat';
import {UreactLoadingWrapper}   from '@udacity/ureact-loading';
import UreactButton             from '@udacity/ureact-button';
import CityStatsCard            from '../components/city/CityStatsCard';
import MultiPanelModal          from '../components/common/MultiPanelModal';
import {
  getLocationColumns
}                               from '../helpers/table-helper';
import DataTable                from '@udacity/ureact-data-table';

import styles                   from './Views.scss';


const mapStateToProps = (state, {params}) => ({
  city: state.cities.cities.find(c => c.id === params.id),
  locations: state.cities.locationsByCity[params.id],
  loading: state.ui.loading
});

@connect(mapStateToProps)
@cssModule(styles)
export default class CityDetails extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showModal: false
    };
  }

  render() {
    const {city, params, locations, loading} = this.props;
    return (
      <UreactLoadingWrapper isLoading={loading.cities}>
        <section>
          {
            city
            ?
            <section>
              <CityStatsCard
                city={city}
              />

              <Localized id='CityDetails_locationsInCity' $cityName={city.name}>
                <h2>Locations in {city.name}</h2>
              </Localized>

              <Localized id='CityDetails_newLocationButton'>
                <UreactButton
                  styleName='create-button'
                  data-l10n-attrs={['label']}
                  onClick={() => this.setState({showModal: true})}
                  type='primary'
                  size='large'
                  label='Create New Location'
                />
              </Localized>
              <Localized id='CityDetails_newLocationButton2'>
                <UreactButton
                  styleName='create-button'
                  onClick={() => this.setState({showModal: true})}
                  type='primary'
                  size='large'
                  label='Create New Location'
                />
              </Localized>

            {
              locations
              ?
              <DataTable
                rows={getLocationColumns(locations)}
                hasFilter={true}
                hasPagination={true}
              />
              :
              null
            }
            </section>
            :
            <Localized id='CityDetails_noCityError' $cityId={params.id}>
              <h1>Oops! No city with id { params.id }</h1>
            </Localized>
          }

          <MultiPanelModal
            open={this.state.showModal}
            panelProps={{
              cityId: params.id
            }}
            onClose={() => this.setState({showModal: false})}
            type={'locAddress'}
          />
        
        </section>
      </UreactLoadingWrapper>
    );
  }
}


export default cssModule(styles)(
  function NotAuthorized() {
    return (
      <div styleName='container'>
        <Localized id='NotAuthorized_oopsMessage'>
          <h1>
            Oops! looks like you're not authorized to use this app.
          </h1>
        </Localized>
        <Localized id='NotAuthorized_testInput'>
          <input
            placeholder='test placeholder'
            data-l10n-attrs={['placeholder']}
          />
        </Localized>
        <Localized id='NotAuthorized_talkToAdmin'>
          <p>Talk to the site administrator if you need access.</p>
        </Localized>
        <Localized
          id='NotAuthorized_possibleActions'
          link={<Link to='/' />}
          a={<a href='https://www.udacity.com' />}
          button={<button onClick={() => signOut()} />} >
          <p>{'<link>Try again</link>, go to <a>Udacity</a> home or <button>Logout</button>'}</p>
        </Localized>
      </div>
      );
    }
);
