import Debug from 'debug';
import { useState, useEffect, useContext } from 'react';
import { RiExchangeFill, RiInformationLine } from 'react-icons/ri';
import { BsShieldLockFill, BsPlusLg } from 'react-icons/bs';
import { AiOutlineFieldTime } from 'react-icons/ai';
import { ImHammer2 } from 'react-icons/im';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import uniqby from 'lodash.uniqby';
import classNames from 'classnames';
import TimeAgo from 'react-timeago';
import CountUp from 'react-countup';
import {
  faUsers,
  faRankingStar,
  faCubes,
} from '@fortawesome/free-solid-svg-icons';
import { useQuery } from '@apollo/client';
import useFetch from 'react-fetch-hook';
import { ethers } from 'ethers';
import RLC from './rlc-logo.svg';
import { getDeals, getTVL } from './queries';
import { Loader } from './Loader';
import { AppContext, validators } from './utils';

const debug = Debug('Page');
const rlcCirculatingSupply = 80999785;
var formatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});
const daysAgo = (x) =>
  Math.round(new Date().setDate(new Date().getDate() - x) / 1000);

const todayTimestamp = daysAgo(0);
const dayAgoTs = daysAgo(1);
const weekAgoTs = daysAgo(7);
const monthAgoTs = daysAgo(30);

const provider = new ethers.providers.JsonRpcProvider(
  'https://bellecour.iex.ec',
);

const Page = () => {
  const {
    loading: dealsLoading,
    error,
    data: { deals = [] } = {},
    fetchMore,
  } = useQuery(getDeals, {
    variables: {
      first: 1000,
      skip: 0,
      timestamp: todayTimestamp,
    },
    onCompleted: debug,
    notifyOnNetworkStatusChange: true,
  });
  debug('dealsLoading', dealsLoading);
  debug('deals', deals);
  debug('error', error);

  const loadMore = () =>
    fetchMore({
      variables: {
        skip: deals.length,
      },
    });

  const {
    loading: tvlLoading,
    error: tvlError,
    data: { protocol = {} } = {},
  } = useQuery(getTVL, {
    variables: {
      first: 1000,
      skip: 0,
      timestamp: todayTimestamp,
    },
    onCompleted: debug,
    notifyOnNetworkStatusChange: true,
  });
  debug('tvlLoading', tvlLoading);
  debug('protocol', protocol);

  const {
    isLoading: cgLoading,
    data: cgData,
    error: cgError,
  } = useFetch(
    'https://api.coingecko.com/api/v3/simple/price?ids=iexec-rlc&vs_currencies=usd',
  );
  debug('cgLoading', cgLoading);
  debug('cgData', cgData);

  const [blockNumber, setBlockNumber] = useState(null);

  const [block, setBlock] = useState({ miner: '0x000' });
  debug('block.miner', block.miner);

  useEffect(() => {
    debug('called useEffect', Date.now());
    provider.on('block', setBlockNumber);
    return () => {
      debug('called useEffect off');
      provider.off('block');
    };
  }, []);

  useEffect(() => {
    provider.getBlock(blockNumber).then(setBlock).catch(debug);
  }, [blockNumber]);

  const { timeframe } = useContext(AppContext);
  debug('timeframe', timeframe);

  const fromTime =
    timeframe === 0 ? dayAgoTs : timeframe === 1 ? weekAgoTs : monthAgoTs;
  debug('fromTime', new Date(fromTime * 1000).toISOString());

  const latestTs = deals[0]?.timestamp;
  debug('deals', deals);
  debug('deals.length', deals.length);
  const uniqueDeals = uniqby(deals, 'id');
  debug('uniqueDeals.length', uniqueDeals.length);
  debug(
    'latestTs',
    latestTs ? new Date(latestTs * 1000).toISOString() : latestTs,
  );
  const oldestTs = deals[deals.length - 1]?.timestamp;
  debug(
    'oldestTs',
    oldestTs ? new Date(oldestTs * 1000).toISOString() : oldestTs,
  );

  const needLoadMore = oldestTs > fromTime;
  debug('needLoadMore', needLoadMore);

  const loading = dealsLoading || needLoadMore;

  useEffect(() => {
    debug('useEffect needLoadMore', needLoadMore);
    if (needLoadMore === true) loadMore(deals.length);
  }, [needLoadMore, deals.length]);
  const timedDeals = deals.filter((deal) => deal.timestamp > fromTime);
  debug('timedDeals.length', timedDeals.length);

  const uniqueRequesters = new Set(timedDeals.map((deal) => deal.requester.id));
  debug('uniqueRequesters', uniqueRequesters);

  const uniqueApps = new Set(timedDeals.map((deal) => deal.app.id));
  debug('uniqueApps', uniqueApps);

  const totalCost = timedDeals.reduce(
    (accu, deal) =>
      accu +
      parseInt(deal.datasetPrice, 10) +
      parseInt(deal.appPrice, 10) +
      parseInt(deal.workerpoolPrice, 10),
    0,
  );
  debug('totalCost', totalCost);

  const appLeaderboard = timedDeals.reduce((accu, deal) => {
    return {
      ...accu,
      ...{
        [deal.app.id]: {
          name: deal.app.name,
          requests: (accu[deal.app.id]?.requests || 0) + 1,
          revenue:
            (accu[deal.app.id]?.appPrice || 0) +
            Number.parseFloat(deal.appPrice),
        },
      },
    };
  }, {});
  debug('appLeaderboard', appLeaderboard);
  const mostRequested = Object.entries(appLeaderboard)
    .sort((a, b) => b[1].requests - a[1].requests)
    .slice(0, 5);
  debug('mostRequested', mostRequested);

  const mostProfitable = Object.entries(appLeaderboard)
    .sort((a, b) => b[1].revenue - a[1].revenue)
    .slice(0, 5);
  debug('mostProfitable', mostProfitable);

  const appsRevenue = Object.values(appLeaderboard).reduce(
    (accu, value) => accu + value.revenue,
    0,
  );
  debug('appsRevenue', appsRevenue);

  if (error)
    return (
      <div className="page">Graphql Request Error: {JSON.stringify(error)}</div>
    );

  if (tvlError)
    return (
      <div className="page">
        Graphql Request Error: {JSON.stringify(tvlError)}
      </div>
    );

  if (cgError)
    return (
      <div className="page">
        Graphql Request Error: {JSON.stringify(cgError)}
      </div>
    );

  const tableRowLoader = (key, isLast) => (
    <div className={classNames('row', 'data', { last: isLast })} key={key}>
      <div className="one column">
        <Loader isLoading={true} width="80%" />
      </div>
      <div className="two column">
        <Loader isLoading={true} width="80%" />
      </div>
      <div className="three column">
        <Loader isLoading={true} width="80%" style={{ marginLeft: 'auto' }} />
      </div>
    </div>
  );

  const tableLoader = [1, 2, 3, 4, 5].map((key, index, array) =>
    tableRowLoader(key, index === array.length - 1),
  );

  return (
    <div className="page">
      <div className="cont_anime">
        <div className="rond_1"></div>
        <div className="rond_2"></div>
        <div className="rond_3"></div>
      </div>
      <div className="page-container">
        <div className="cards">
          <div className="card a">
            <div className="card-first-row">
              <div
                className="value-title hint--top-right hint--medium hint--rounded hint--iexeccolor"
                aria-label="The last dollar price of the RLC token (CoinGecko)"
              >
                RLC Price
                <RiInformationLine className="helper-icon" />
              </div>
              <img
                className="card-logo rlc-logo"
                src={RLC}
                alt="iExec RLC logo"
              />
            </div>
            <div className="card-value">
              <Loader isLoading={cgLoading}>
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  href="https://www.coingecko.com/en/coins/iexec-rlc"
                >
                  <CountUp
                    duration={1}
                    decimals={2}
                    prefix="$"
                    end={cgData?.['iexec-rlc']?.usd}
                  />
                </a>
              </Loader>
            </div>
            <div className="card-bottom-value">
              Market Cap:{' '}
              <Loader isLoading={cgLoading} style={{ marginLeft: 10 }}>
                {formatter.format(
                  cgData?.['iexec-rlc']?.usd * rlcCirculatingSupply,
                  0,
                )}
              </Loader>
            </div>
          </div>
          <div className="card b">
            <div className="card-first-row">
              <div
                className="value-title hint--top-right hint--medium hint--rounded hint--iexeccolor"
                aria-label="The quantity of RLC tokens spent in the iExec marketplace over the selected timeframe"
              >
                RLC Exchanged
                <RiInformationLine className="helper-icon" />
              </div>
              <RiExchangeFill className="card-logo" />
            </div>
            <div className="card-value">
              <Loader isLoading={loading}>{totalCost} RLC</Loader>
            </div>
            <div className="card-bottom-value">
              All DApps revenue:{' '}
              <Loader isLoading={loading} style={{ marginLeft: 10 }}>
                {appsRevenue} RLC
              </Loader>
            </div>
          </div>
          <div className="card c">
            <div className="card-first-row">
              <div
                className="value-title hint--top-right hint--medium hint--rounded hint--iexeccolor"
                aria-label="Number of users who have been active at least once in the selected timeframe"
              >
                Active Users
                <RiInformationLine className="helper-icon" />
              </div>
              <FontAwesomeIcon
                icon={faUsers}
                className="card-logo users-logo"
              />
            </div>
            <div className="card-value">
              <Loader isLoading={loading}>{uniqueRequesters.size}</Loader>
            </div>
            <div className="card-bottom-value">
              Active DApps:{' '}
              <Loader isLoading={loading} style={{ marginLeft: 10 }}>
                {uniqueApps.size}
              </Loader>
            </div>
          </div>
          <div className="card d">
            <div className="card-first-row">
              <div
                className="value-title hint--top-right hint--medium hint--rounded hint--iexeccolor"
                aria-label="Total Value Locked refers to the current amount of RLC tokens deposited in the iExec marketplace"
              >
                TVL
                <RiInformationLine className="helper-icon" />
              </div>
              <BsShieldLockFill className="card-logo" />
            </div>
            <div className="card-value">
              <Loader isLoading={tvlLoading}>
                <CountUp
                  duration={1}
                  suffix=" RLC"
                  end={Math.round(Number.parseFloat(protocol?.tvl))}
                />
              </Loader>
            </div>
            <div className="card-bottom-value">
              <Loader
                isLoading={tvlLoading && cgLoading}
                style={{ marginLeft: 10 }}
              >
                USD Value:{' '}
                {formatter.format(
                  Number.parseFloat(protocol?.tvl) * cgData?.['iexec-rlc']?.usd,
                  0,
                )}
              </Loader>
            </div>
          </div>
          <div className="card e">
            <div className="card-first-row">
              <div className="value-title">Most Requested DApps</div>
              <FontAwesomeIcon icon={faRankingStar} className="card-logo" />
            </div>
            <div className="table">
              <div className="row head">
                <div className="one column">ID</div>
                <div className="two column">Name</div>
                <div className="three column"># Requests</div>
              </div>
              {loading ? (
                tableLoader
              ) : mostRequested.length > 0 ? (
                mostRequested.map(([appKey, appValue], index) => (
                  <div
                    className={classNames('row', 'data', {
                      last: index === mostRequested.length - 1,
                    })}
                    key={appKey}
                  >
                    <div className="one column">
                      <Loader isLoading={loading} width="80%">
                        <a
                          target="_blank"
                          rel="noopener noreferrer"
                          href={`https://explorer.iex.ec/bellecour/app/${appKey}`}
                        >
                          <p>{appKey.slice(0, 6).concat('...')}</p>
                        </a>
                      </Loader>
                    </div>

                    <div className="two column">
                      <Loader isLoading={loading} width="80%">
                        <p>{appValue.name}</p>
                      </Loader>
                    </div>
                    <div className="three column big">
                      <Loader
                        isLoading={loading}
                        width="80%"
                        style={{ marginLeft: 'auto' }}
                      >
                        <p>{appValue.requests}</p>
                      </Loader>
                    </div>
                  </div>
                ))
              ) : (
                <div className="row data last empty">
                  No DApp usage over the selected timeframe
                </div>
              )}
            </div>
          </div>
          <div className="card f">
            <div className="card-first-row">
              <div className="value-title">Most Profitable DApps</div>
              <FontAwesomeIcon icon={faRankingStar} className="card-logo" />
            </div>
            <div className="table">
              <div className="row head">
                <div className="one column">ID</div>
                <div className="two column">Name</div>
                <div className="three column"># RLC Earned</div>
              </div>
              {loading ? (
                tableLoader
              ) : mostProfitable.length > 0 ? (
                mostProfitable.map(([appKey, appValue], index) => (
                  <div
                    className={classNames('row', 'data', {
                      last: index === mostRequested.length - 1,
                    })}
                    key={appKey}
                  >
                    <div className="one column">
                      <Loader isLoading={loading} width="80%">
                        <a
                          target="_blank"
                          rel="noopener noreferrer"
                          href={`https://explorer.iex.ec/bellecour/app/${appKey}`}
                        >
                          <p>{appKey.slice(0, 6).concat('...')}</p>
                        </a>
                      </Loader>
                    </div>

                    <div className="two column">
                      <Loader isLoading={loading} width="80%">
                        <p>{appValue.name}</p>
                      </Loader>
                    </div>
                    <div className="three column big">
                      <Loader
                        isLoading={loading}
                        width="80%"
                        style={{ marginLeft: 'auto' }}
                      >
                        <p>
                          {appValue.revenue}
                          <img
                            className="rlc-earned"
                            src={RLC}
                            alt="iExec RLC logo"
                          />
                        </p>
                      </Loader>
                    </div>
                  </div>
                ))
              ) : (
                <div className="row data last empty">
                  No DApp usage over the selected timeframe
                </div>
              )}
            </div>
          </div>
          <div className="card f">
            <div className="card-first-row">
              <div className="value-title">
                Latest Transactions{' '}
                <a
                  className="see-all"
                  target="_blank"
                  rel="noopener noreferrer"
                  href="https://explorer.iex.ec"
                >
                  see all
                </a>
              </div>
              <AiOutlineFieldTime className="card-logo" />
            </div>
            <div className="table compact">
              <div className="row head">
                <div className="one column">Time</div>
                <div className="two column">Task</div>
                <div className="three column">Status</div>
              </div>
              {loading ? (
                tableLoader
              ) : deals.length > 0 ? (
                deals.slice(0, 5).map((deal, index, dealsArray) => (
                  <a
                    target="_blank"
                    rel="noopener noreferrer"
                    href={`https://explorer.iex.ec/bellecour/deal/${deal.id}`}
                    key={deal.id}
                  >
                    <div
                      className={classNames('row', 'data', {
                        last: index === dealsArray.length - 1,
                      })}
                    >
                      <div className="one column">
                        <Loader isLoading={loading} width="80%">
                          <p>
                            <TimeAgo
                              date={
                                new Date(
                                  Number.parseInt(deal.timestamp, 10) * 1000,
                                )
                              }
                            />
                          </p>
                        </Loader>
                      </div>

                      <div className="two column">
                        <Loader isLoading={loading} width="80%">
                          <p>{deal.id.slice(0, 6).concat('...')}</p>
                        </Loader>
                      </div>
                      <div className="three column">
                        <Loader
                          isLoading={loading}
                          width="80%"
                          style={{ marginLeft: 'auto' }}
                        >
                          <p>{deal?.tasks[0]?.status || 'PENDING INIT'}</p>
                        </Loader>
                      </div>
                    </div>
                  </a>
                ))
              ) : (
                <div className="row data last empty">
                  No transactions over the selected timeframe
                </div>
              )}
            </div>
          </div>
          <div className="card g">
            <div className="card-first-row">
              <div className="value-title">Latest Block</div>
              <FontAwesomeIcon icon={faCubes} className="card-logo" />
            </div>
            <div className="card-value">
              <Loader isLoading={blockNumber === null}>
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  href={`https://blockscout-bellecour.iex.ec/blocks/${blockNumber}/transactions`}
                >
                  {blockNumber}
                </a>
              </Loader>
            </div>
            <div className="card-bottom-value">
              Block speed:{' '}
              <Loader isLoading={false} style={{ marginLeft: 10 }}>
                5.4s
              </Loader>
            </div>
          </div>
          <div className="card g">
            <div className="card-first-row">
              <div className="value-title">Validator</div>
              <ImHammer2 className="card-logo" />
            </div>
            <div className="card-value">
              <Loader isLoading={blockNumber === null}>
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  href={`https://blockscout-bellecour.iex.ec/address/${block.miner}`}
                >
                  {block.miner.slice(0, 8).concat('...')}
                </a>
              </Loader>
            </div>
            <div className="card-bottom-value">
              # of Validators:{' '}
              <Loader isLoading={false} style={{ marginLeft: 10 }}>
                {validators.length}
              </Loader>
            </div>
          </div>
          <a
            target="_blank"
            rel="noopener noreferrer"
            href="https://iexecblockchaintech.typeform.com/to/unGelOrH"
            className="card h"
          >
            <div className="value-title">Suggest a new metric</div>
            <div className="plus-logo-div">
              <BsPlusLg className="plus-logo" />
            </div>
          </a>
        </div>
      </div>
    </div>
  );
};

export default Page;
