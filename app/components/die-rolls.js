import Component from '@ember/component';
import { scheduleOnce } from '@ember/runloop';

// D3 Imports
import { select } from 'd3-selection';
import { scaleLinear } from 'd3-scale';
import { extent, ascending } from 'd3-array';
import { transition } from 'd3-transition';
import { easeCubicInOut } from 'd3-ease';

export default Component.extend({
  tagName: 'svg',
  attributeBindings: ['width', 'height'],

  data: null,
  height: 200,
  width: 720,

  init() {
    this._super();

    this.data = [
      [ 5,     20 ],
      [ 480,   90 ],
      [ 250,   50 ],
      [ 100,   33 ],
      [ 330,   95 ],
      [ 410,   12 ],
      [ 475,   44 ],
      [ 25,    67 ],
      [ 85,    21 ],
      [ 220,   88 ]
    ];
  },

  didReceiveAttrs() {
    scheduleOnce('render', this, this.draw);
  },

  draw() {
    const { data, element, height, width } = this;
    const plot = select(element);
    const t = transition()
      .duration(250)
      .ease(easeCubicInOut);

    // X scale to scale position on x axis
    let xScale = scaleLinear()
      .domain(extent(data.map(d => d[0])))
      .range([0, width]);

    // Y scale to scale radius of circles proportional to size of plot
    let yScale = scaleLinear()
      .domain(
        // `extent()` requires that data is sorted ascending
        extent(data.map(d => d[1]).sort(ascending))
      )
      .range([0, height]);

    // UPDATE EXISTING
    let circles = plot.selectAll('circle').data(data);

    // EXIT
    circles
      .exit()
      .transition(t)
      .attr('r', 0)
      .remove();

    // ENTER
    let enterJoin = circles
      .enter()
      .append('circle')
      .attr('fill', 'steelblue')
      .attr('opacity', 0.5)
      .attr('r', () => 0) // Set initial size to 0 so we can animate it in from 0 to actual scaled radius
      .attr('cy', () => height / 2)
      .attr('cx', d => xScale(d[0]));

    // MERGE + UPDATE EXISTING
    enterJoin
      .merge(circles)
      .transition(t)
      .attr('r', d => yScale(d[1]) / 2)
      .attr('cy', () => height / 2)
      .attr('cx', d => xScale(d[0]));
  }
});
