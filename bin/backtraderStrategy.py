import alpaca_backtrader_api
import backtrader as bt
from datetime import datetime
from pandas_datareader import data as pdr
from empyrical import max_drawdown, alpha_beta, annual_volatility, calmar_ratio, omega_ratio, sharpe_ratio, sortino_ratio, downside_risk, tail_ratio, cagr, annual_return
import numpy as np

# Your credentials here
# change to True if you want to do live paper trading with Alpaca Broker.
#  False will do a back test


class MyStrategy(bt.Strategy):
    # list of parameters which are configurable for the strategy
    params = dict(
        pfast=10,  # period for the fast moving average
        pslow=30,   # period for the slow moving average
        rsi_per=14,
        rsi_upper=65.0,
        rsi_lower=35.0,
        rsi_out=50.0,
        warmup=35
    )

    def log(self, txt, dt=None):
        dt = dt or self.data.datetime[0]
        dt = bt.num2date(dt)
        print('%s, %s' % (dt.isoformat(), txt))

    def notify_trade(self, trade):
        self.log("placing trade for {}. target size: {}".format(
            trade.getdataname(),
            trade.size))

    def notify_order(self, order):
        pass

    def stop(self):
        print('==================================================')
        print('Starting Value - %.2f' % self.broker.startingcash)
        print('Ending   Value - %.2f' % self.broker.getvalue())
        print('==================================================')

    def __init__(self):
        sma1 = bt.ind.SMA(self.data0, period=self.p.pfast)
        sma2 = bt.ind.SMA(self.data0, period=self.p.pslow)
        self.crossover = bt.ind.CrossOver(sma1, sma2)

        rsi = bt.indicators.RSI(period=self.p.rsi_per,
                                upperband=self.p.rsi_upper,
                                lowerband=self.p.rsi_lower)

        self.crossdown = bt.ind.CrossDown(rsi, self.p.rsi_upper)
        self.crossup = bt.ind.CrossUp(rsi, self.p.rsi_lower)

    def next(self):
        # if fast crosses slow to the upside
        if not self.positionsbyname["GOOG"].size:
            if self.crossover > 0 or self.crossup > 0:
                self.buy(data=self.data0, size=5)  # enter long

        # in the market & cross to the downside
        if self.positionsbyname["GOOG"].size:
            if self.crossover <= 0 or self.crossdown < 0:
                self.close(data=self.data0)  # close long position
