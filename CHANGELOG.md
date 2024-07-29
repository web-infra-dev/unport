# [0.7.0](https://github.com/web-infra-dev/unport/compare/v0.6.0...v0.7.0) (2024-07-29)


### Features

* add offListener method ([91ee549](https://github.com/web-infra-dev/unport/commit/91ee5499ec69f3368b7adc447bdcd2e663bccf1c))



# [0.6.0](https://github.com/ulivz/unport/compare/v0.5.0...v0.6.0) (2024-06-04)


### Features

* typed rpc ([#3](https://github.com/ulivz/unport/issues/3)) ([baa5645](https://github.com/ulivz/unport/commit/baa5645c96a7aade2166ae7e99252b49e3f0c03a))



# [0.5.0](https://github.com/ulivz/unport/compare/v0.3.1...v0.5.0) (2023-11-17)

To streamline usage, we have implemented a significant update: the basic concept `UnportChannel` has been renamed to `Channel`, see [3e2bcc7](https://github.com/web-infra-dev/unport/commit/3e2bcc73bb97e7d46b7c7f79a1b9481c98157bdc).

# [0.4.0](https://github.com/ulivz/unport/compare/v0.3.1...v0.4.0) (2023-11-17)


To support `one-to-many` scenarios and avoid creating multiple Unport instances, we have introduced the [Channel.pipe](https://github.com/web-infra-dev/unport#pipe) method. This allows users to manually send messages through the intermediary pipeline, enhancing efficiency and flexibility, see [b8ef448](https://github.com/web-infra-dev/unport/commit/b8ef4482088e994eef37823a6991a67a93c5c77c).



## [0.3.1](https://github.com/ulivz/unport/compare/v0.3.0...v0.3.1) (2023-11-17)

This is a patch release where we have removed some unnecessary logs 


# [0.3.0](https://github.com/ulivz/unport/compare/v0.2.0...v0.3.0) (2023-11-17)


Added support for watching messages multiple times and provided users with the ability to destroy a port ([#1](https://github.com/ulivz/unport/issues/1)) ([a179e61](https://github.com/ulivz/unport/commit/a179e616983004f04e40ae9b85ea73cbe81d9083))


# [0.2.0](https://github.com/ulivz/unport/compare/v0.1.0...v0.2.0) (2023-11-17)

Renamed the exported `UnPort` to `Unport` for consistency and ease of use, see [b1b8b56](b1b8b5694043f1bccbe3f86b78b20351988c0d4f).


# [0.1.0](https://github.com/ulivz/unport/compare/93c89d960e8dab105e5e1b46df2b2179bdb1c945...v0.1.0) (2023-11-16)

This is the inaugural release of Unport. It encapsulates the core concept of Unport: `TypedPort = f(types, channel)`. We have successfully implemented the fundamental functionalities.


