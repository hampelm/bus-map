bus-map
=======

A map of all active DDOT buses. It updates every 2.5 seconds.


How we did it
--------------

This map uses the [DDOT real-time data API](http://appsfordetroit.org/ddot.html) (and so can you!

The City has installed trackers on all the buses. When they're active, they
broadcast the bus position to DDOT HQ. That information is made available 
through the [TextMyBus API](http://appsfordetroit.org/ddot.html).
